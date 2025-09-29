import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  return useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          suppliers(name),
          inventory_item_locations(
            quantity,
            inventory_locations(name)
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching inventory items:", error);
        throw error;
      }

      return data as InventoryItem[];
    },
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

  return useMutation({
    mutationFn: async (itemData: CreateInventoryItemData) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .insert([{
          ...itemData,
          reserved_stock: 0,
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating inventory item:", error);
        throw error;
      }

      return data;
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