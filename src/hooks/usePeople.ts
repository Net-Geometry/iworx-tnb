import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { peopleApi } from "@/services/api-client";

export interface Person {
  id: string;
  user_id?: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  hire_date?: string;
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  job_title?: string;
  department?: string;
  hourly_rate?: number;
  certifications?: string[];
  notes?: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  business_areas?: Array<{
    id: string;
    business_area_id: string;
    is_primary: boolean;
    assigned_date: string;
    business_area: {
      id: string;
      business_area: string | null;
      region: string | null;
      state: string | null;
      station: string | null;
    };
  }>;
}

export const usePeople = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["people", currentOrganization?.id],
    queryFn: async () => {
      try {
        // Try microservice first
        const data = await peopleApi.getPeople();
        return data as Person[];
      } catch (microserviceError) {
        console.warn('[usePeople] Microservice failed, falling back to direct Supabase:', microserviceError);
        
        // Fallback to direct Supabase call
        let query = supabase
          .from("people")
          .select("*")
          .order("last_name");

        if (!hasCrossProjectAccess && currentOrganization) {
          query = query.eq("organization_id", currentOrganization.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Person[];
      }
    },
    enabled: !!currentOrganization || hasCrossProjectAccess,
  });

  const createPerson = useMutation({
    mutationFn: async (personData: Partial<Person>) => {
      try {
        return await peopleApi.createPerson({
          ...personData,
          organization_id: currentOrganization?.id,
        });
      } catch (microserviceError) {
        console.warn('[createPerson] Microservice failed, falling back to direct Supabase:', microserviceError);
        const dataWithOrg = {
          ...personData,
          organization_id: currentOrganization?.id,
        };
        
        const { data, error } = await supabase
          .from("people")
          .insert([dataWithOrg as any])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast({
        title: "Person Created",
        description: "The person has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create person.",
      });
    },
  });

  const updatePerson = useMutation({
    mutationFn: async ({ id, ...personData }: Partial<Person> & { id: string }) => {
      try {
        return await peopleApi.updatePerson(id, personData);
      } catch (microserviceError) {
        console.warn('[updatePerson] Microservice failed, falling back to direct Supabase:', microserviceError);
        const { data, error } = await supabase
          .from("people")
          .update(personData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast({
        title: "Person Updated",
        description: "The person has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update person.",
      });
    },
  });

  const deletePerson = useMutation({
    mutationFn: async (personId: string) => {
      try {
        await peopleApi.deletePerson(personId);
      } catch (microserviceError) {
        console.warn('[deletePerson] Microservice failed, falling back to direct Supabase:', microserviceError);
        const { error } = await supabase
          .from("people")
          .delete()
          .eq("id", personId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast({
        title: "Person Deleted",
        description: "The person has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete person.",
      });
    },
  });

  return {
    people,
    isLoading,
    createPerson,
    updatePerson,
    deletePerson,
  };
};