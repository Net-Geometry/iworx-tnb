import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessArea {
  id: string;
  ba_id: number | null;
  ba_number: number | null;
  business_area: string | null;
  region: string | null;
  state: string | null;
  station: string | null;
  ppb_zone: string | null;
  label: string | null;
  status: string | null;
  tnb_source: number | null;
  source_dat: string | null;
}

export const useBusinessAreas = () => {
  return useQuery({
    queryKey: ["business-areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_area")
        .select("*")
        .order("business_area", { ascending: true });

      if (error) throw error;
      return data as BusinessArea[];
    },
  });
};

export const useBusinessArea = (id: string | null) => {
  return useQuery({
    queryKey: ["business-area", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("business_area")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as BusinessArea | null;
    },
    enabled: !!id,
  });
};
