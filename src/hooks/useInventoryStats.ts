import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inventoryApi } from "@/services/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export const useInventoryStats = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["inventory-stats", currentOrganization?.id],
    queryFn: async (): Promise<InventoryStats> => {
      // Try microservice first
      try {
        const response = await inventoryApi.getStats();
        return response;
      } catch (apiError) {
        console.warn("Microservice call failed, falling back to direct query:", apiError);
        
        // Fallback to direct Supabase query
        let itemsQuery = supabase
          .from("inventory_items")
          .select("current_stock, unit_cost", { count: "exact" })
          .eq("is_active", true);

        if (!hasCrossProjectAccess && currentOrganization?.id) {
          itemsQuery = itemsQuery.eq("organization_id", currentOrganization.id);
        }

        const { data: itemsData, error: itemsError, count } = await itemsQuery;
        if (itemsError) throw itemsError;

        // Calculate total value
        const totalValue = itemsData?.reduce((sum, item) => {
          return sum + (item.current_stock || 0) * (item.unit_cost || 0);
        }, 0) || 0;

        // Query low stock items - items where current_stock <= reorder_point
        // Since we can't use .raw(), we'll fetch all items and filter in JS
        let lowStockQuery = supabase
          .from("inventory_items")
          .select("current_stock, reorder_point")
          .eq("is_active", true);

        if (!hasCrossProjectAccess && currentOrganization?.id) {
          lowStockQuery = lowStockQuery.eq("organization_id", currentOrganization.id);
        }

        const { data: allItems, error: lowStockError } = await lowStockQuery;
        if (lowStockError) throw lowStockError;

        const lowStockCount = allItems?.filter(item => 
          (item.current_stock || 0) <= (item.reorder_point || 0)
        ).length || 0;

        // Query pending purchase orders
        let poQuery = supabase
          .from("purchase_orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "approved"]);

        if (!hasCrossProjectAccess && currentOrganization?.id) {
          poQuery = poQuery.eq("organization_id", currentOrganization.id);
        }

        const { count: pendingOrdersCount } = await poQuery;

        return {
          totalItems: count || 0,
          totalValue,
          lowStockCount,
          pendingOrdersCount: pendingOrdersCount || 0,
        };
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};
