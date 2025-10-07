import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inventoryApi } from "@/services/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface InventoryTransaction {
  id: string;
  transaction_type: string;
  transaction_date: string;
  quantity: number;
  reference_type?: string;
  item_id?: string;
}

interface InventoryItem {
  name: string;
}

export const useInventoryTransactions = (limit: number = 10) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["inventory-transactions", currentOrganization?.id, limit],
    queryFn: async (): Promise<Array<InventoryTransaction & { item?: InventoryItem }>> => {
      // Try microservice first
      try {
        const response = await inventoryApi.getRecentTransactions(limit);
        return response;
      } catch (apiError) {
        console.warn("Microservice call failed, falling back to direct query:", apiError);
        
        // Fallback to direct Supabase query
        let query = supabase
          .from("inventory_transactions")
          .select("id, transaction_type, transaction_date, quantity, reference_type, item_id");

        if (!hasCrossProjectAccess && currentOrganization?.id) {
          query = query.eq("organization_id", currentOrganization.id);
        }

        const { data, error: queryError } = await query
          .order("transaction_date", { ascending: false })
          .limit(limit);

        if (queryError) throw queryError;

        // Fetch item names separately
        if (data && data.length > 0) {
          const itemIds = data.map(t => t.item_id).filter(Boolean);
          
          if (itemIds.length > 0) {
            const { data: items } = await supabase
              .from("inventory_items")
              .select("id, name")
              .in("id", itemIds);

            const itemMap = new Map(items?.map(item => [item.id, item]) || []);

            return data.map(transaction => ({
              ...transaction,
              item: transaction.item_id ? itemMap.get(transaction.item_id) : undefined
            }));
          }
        }

        return data || [];
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};
