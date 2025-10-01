import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Person } from "@/hooks/usePeople";

/**
 * Hook for fetching a single person by ID with their business area
 * Returns the same Person type as usePeople for compatibility
 */
export const usePerson = (personId: string | undefined) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  return useQuery({
    queryKey: ["person", personId, currentOrganization?.id],
    queryFn: async () => {
      if (!personId) return null;

      let query = supabase
        .from("people")
        .select(`
          *,
          person_business_areas!inner (
            id,
            business_area_id,
            is_primary,
            assigned_date,
            business_area (
              id,
              business_area,
              region,
              state,
              station
            )
          )
        `)
        .eq("id", personId);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      // Transform the data to match Person interface with business_areas array
      if (data) {
        const transformed = {
          ...data,
          business_areas: (data as any).person_business_areas || [],
        };
        delete (transformed as any).person_business_areas;
        return transformed as Person;
      }
      
      return null;
    },
    enabled: !!personId && (!!currentOrganization || hasCrossProjectAccess),
  });
};
