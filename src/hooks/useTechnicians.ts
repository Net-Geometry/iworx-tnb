import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  job_title?: string;
  business_areas?: Array<{
    business_area: {
      station: string | null;
      business_area: string | null;
      state: string | null;
    };
  }>;
}

export const useTechnicians = (incidentLocation?: string) => {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const { data: technicians = [], isLoading } = useQuery({
    queryKey: ["technicians", currentOrganization?.id, incidentLocation],
    queryFn: async () => {
      // Build the query to fetch people with technician role
      let query = supabase
        .from("people")
        .select(`
          id,
          first_name,
          last_name,
          employee_number,
          job_title,
          user_id
        `)
        .eq("is_active", true)
        .order("last_name");

      // Filter by organization
      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data: peopleData, error: peopleError } = await query;
      if (peopleError) throw peopleError;

      if (!peopleData || peopleData.length === 0) return [];

      // Get user IDs
      const userIds = peopleData
        .map(p => p.user_id)
        .filter((id): id is string => !!id);

      if (userIds.length === 0) return [];

      // Get users with technician role
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role:roles (
            name
          )
        `)
        .in("user_id", userIds)
        .eq("role.name", "technician");

      if (rolesError) throw rolesError;

      // Get set of user IDs with technician role
      const technicianUserIds = new Set(
        userRoles?.map(ur => ur.user_id) || []
      );

      // Filter people to only include those with technician role
      let technicians = peopleData.filter(
        person => person.user_id && technicianUserIds.has(person.user_id)
      );

      // If we need location filtering, fetch business areas for filtered technicians
      if (incidentLocation && technicians.length > 0) {
        const technicianIds = technicians.map(t => t.id);
        
        const { data: businessAreaData, error: baError } = await supabase
          .from("person_business_areas")
          .select(`
            person_id,
            business_area:business_area (
              station,
              business_area,
              state
            )
          `)
          .in("person_id", technicianIds);

        if (!baError && businessAreaData) {
          // Create a map of person_id to business areas
          const baMap = new Map<string, any[]>();
          businessAreaData.forEach(pba => {
            if (!baMap.has(pba.person_id)) {
              baMap.set(pba.person_id, []);
            }
            baMap.get(pba.person_id)?.push(pba);
          });

          // Filter technicians by location
          const locationFilteredTechnicians = technicians.filter(tech => {
            const businessAreas = baMap.get(tech.id);
            if (!businessAreas || businessAreas.length === 0) return false;

            return businessAreas.some(pba => {
              const ba = pba.business_area;
              if (!ba) return false;

              const location = incidentLocation.toLowerCase();
              return (
                ba.station?.toLowerCase().includes(location) ||
                ba.business_area?.toLowerCase().includes(location) ||
                ba.state?.toLowerCase().includes(location)
              );
            });
          });

          // If location filtering returns results, use them; otherwise show all
          if (locationFilteredTechnicians.length > 0) {
            // Transform with business areas
            return locationFilteredTechnicians.map(tech => ({
              id: tech.id,
              first_name: tech.first_name,
              last_name: tech.last_name,
              employee_number: tech.employee_number,
              job_title: tech.job_title,
              business_areas: baMap.get(tech.id)?.map(pba => ({
                business_area: pba.business_area
              })) || []
            })) as Technician[];
          }
        }
      }

      // Return all technicians without business area details
      return technicians.map(tech => ({
        id: tech.id,
        first_name: tech.first_name,
        last_name: tech.last_name,
        employee_number: tech.employee_number,
        job_title: tech.job_title,
        business_areas: []
      })) as Technician[];
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });

  return {
    technicians,
    isLoading,
  };
};
