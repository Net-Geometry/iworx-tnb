import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  tax_id?: string;
  payment_terms?: number;
  rating?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  tax_id?: string | null;
  payment_terms?: number;
  is_active: boolean;
  notes?: string | null;
}

export const useSuppliers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching suppliers:", error);
        throw error;
      }

      return data as Supplier[];
    },
  });

  const addSupplier = useMutation({
    mutationFn: async (supplierData: CreateSupplierData) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert([supplierData])
        .select()
        .single();

      if (error) {
        console.error("Error adding supplier:", error);
        throw error;
      }

      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    ...query,
    addSupplier,
  };
};