import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi } from "@/services/api-client";

export interface InventoryItem {
  id: string;
  item_number?: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  unit_of_measure?: string;
  barcode?: string;
  qr_code_data?: string;
  current_stock?: number;
  available_stock?: number;
  reserved_stock?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  safety_stock?: number;
  max_stock_level?: number;
  unit_cost?: number;
  average_cost?: number;
  last_cost?: number;
  supplier_id?: string;
  is_serialized?: boolean;
  is_active?: boolean;
  lead_time_days?: number;
  item_image_url?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryItemData {
  item_number?: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  unit_of_measure?: string;
  barcode?: string;
  current_stock?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  safety_stock?: number;
  max_stock_level?: number;
  unit_cost?: number;
  supplier_id?: string;
  is_serialized?: boolean;
  is_active?: boolean;
  lead_time_days?: number;
  item_image_url?: string;
}

export const useInventoryItems = () => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["inventory-items", currentOrganization?.id],
    queryFn: async () => {
      try {
        // Try microservice first
        const data = await inventoryApi.getItems();
        return data as InventoryItem[];
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // ✅ OPTIMIZED: Try nested query first, fallback to batch queries
        let query = supabase
          .from("inventory_items")
          .select(`
            *,
            suppliers(name),
            inventory_item_locations(
              quantity,
              inventory_locations(name)
            )
          `)
          .eq("is_active", true);

        if (!hasCrossProjectAccess && currentOrganization) {
          query = query.eq("organization_id", currentOrganization.id);
        }

        const { data, error } = await query.order("name");

        if (error) {
          console.warn("Nested query failed, using batch queries:", error);
          
          // Double fallback: batch queries
          let itemsQuery = supabase.from("inventory_items").select("*").eq("is_active", true);
          if (!hasCrossProjectAccess && currentOrganization) {
            itemsQuery = itemsQuery.eq("organization_id", currentOrganization.id);
          }
          
          const { data: items, error: itemsError } = await itemsQuery.order("name");
          if (itemsError) throw itemsError;

          const supplierIds = [...new Set(items.filter(i => i.supplier_id).map(i => i.supplier_id))];
          const { data: suppliers } = supplierIds.length > 0
            ? await supabase.from("suppliers").select("id, name").in("id", supplierIds)
            : { data: [] };

          return items.map(item => ({
            ...item,
            suppliers: suppliers?.find(s => s.id === item.supplier_id) || null
          })) as InventoryItem[];
        }

        return data as InventoryItem[];
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });
};

export interface UpdateInventoryItemData {
  item_number?: string;
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  unit_of_measure?: string;
  barcode?: string;
  current_stock?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  safety_stock?: number;
  max_stock_level?: number;
  unit_cost?: number;
  supplier_id?: string;
  is_serialized?: boolean;
  is_active?: boolean;
  lead_time_days?: number;
  item_image_url?: string;
}

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (itemData: CreateInventoryItemData) => {
      try {
        // Try microservice first
        const data = await inventoryApi.createItem(itemData);
        return data;
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // Fallback to direct Supabase call
        const { data, error } = await supabase
          .from("inventory_items")
          .insert([{
            ...itemData,
            reserved_stock: 0,
            organization_id: currentOrganization?.id,
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating inventory item:", error);
          throw error;
        }

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to create inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to create inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, itemData }: { id: string; itemData: UpdateInventoryItemData }) => {
      try {
        // Try microservice first
        const data = await inventoryApi.updateItem(id, itemData);
        return data;
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // Fallback to direct Supabase call
        const { data, error } = await supabase
          .from("inventory_items")
          .update(itemData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating inventory item:", error);
          throw error;
        }

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });
};