import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi } from "@/services/api-client";

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
  organization_id: string;
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
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", currentOrganization?.id],
    queryFn: async () => {
      try {
        // Try microservice first
        const data = await inventoryApi.getSuppliers();
        return data as Supplier[];
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // Fallback to direct Supabase call
        let supplierQuery = supabase
          .from("suppliers")
          .select("*");

        if (!hasCrossProjectAccess && currentOrganization) {
          supplierQuery = supplierQuery.eq("organization_id", currentOrganization.id);
        }

        const { data, error } = await supplierQuery.order("name");

        if (error) {
          console.error("Error fetching suppliers:", error);
          throw error;
        }

        return data as Supplier[];
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });

  const addSupplier = useMutation({
    mutationFn: async (supplierData: CreateSupplierData) => {
      try {
        // Try microservice first
        const data = await inventoryApi.createSupplier(supplierData);
        return data as Supplier;
      } catch (microserviceError) {
        console.warn("Microservice failed, falling back to direct Supabase:", microserviceError);
        
        // Fallback to direct Supabase call
        const { data, error } = await supabase
          .from("suppliers")
          .insert([{
            ...supplierData,
            organization_id: currentOrganization?.id,
          }])
          .select()
          .single();

        if (error) {
          console.error("Error adding supplier:", error);
          throw error;
        }

        return data as Supplier;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    ...suppliersQuery,
    addSupplier,
  };
};