import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { metersApi } from '@/services/api-client';

export interface MeterGroup {
  id: string;
  organization_id: string;
  group_number: string;
  name: string;
  description?: string;
  group_type?: 'revenue' | 'monitoring' | 'zone' | 'feeder';
  purpose?: string;
  hierarchy_node_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useMeterGroups = () => {
  const [meterGroups, setMeterGroups] = useState<MeterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMicroservice, setUseMicroservice] = useState(true);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchMeterGroups = async () => {
    try {
      setLoading(true);

      if (useMicroservice) {
        try {
          const data = await metersApi.groups.getAll();
          setMeterGroups(data || []);
          return;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      let query = supabase.from('meter_groups').select('*');

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setMeterGroups((data || []) as MeterGroup[]);
    } catch (error: any) {
      console.error('Error fetching meter groups:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeterGroup = async (groupData: Omit<MeterGroup, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    try {
      if (useMicroservice) {
        try {
          const data = await metersApi.groups.create(groupData);
          toast({
            title: "Success",
            description: "Meter group created successfully",
          });
          await fetchMeterGroups();
          return data;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { data, error } = await supabase
        .from('meter_groups')
        .insert([{
          ...groupData,
          organization_id: currentOrganization?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter group created successfully",
      });

      await fetchMeterGroups();
      return data;
    } catch (error: any) {
      console.error('Error adding meter group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMeterGroup = async (id: string, groupData: Partial<MeterGroup>) => {
    try {
      if (useMicroservice) {
        try {
          const data = await metersApi.groups.update(id, groupData);
          toast({
            title: "Success",
            description: "Meter group updated successfully",
          });
          await fetchMeterGroups();
          return data;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { data, error } = await supabase
        .from('meter_groups')
        .update(groupData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter group updated successfully",
      });

      await fetchMeterGroups();
      return data;
    } catch (error: any) {
      console.error('Error updating meter group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMeterGroup = async (id: string) => {
    try {
      if (useMicroservice) {
        try {
          await metersApi.groups.delete(id);
          toast({
            title: "Success",
            description: "Meter group deleted successfully",
          });
          await fetchMeterGroups();
          return;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { error } = await supabase
        .from('meter_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter group deleted successfully",
      });

      await fetchMeterGroups();
    } catch (error: any) {
      console.error('Error deleting meter group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (currentOrganization || hasCrossProjectAccess) {
      fetchMeterGroups();
    }
  }, [currentOrganization?.id, hasCrossProjectAccess]);

  return {
    meterGroups,
    loading,
    refetch: fetchMeterGroups,
    addMeterGroup,
    updateMeterGroup,
    deleteMeterGroup,
  };
};