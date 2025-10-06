import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { metersApi } from '@/services/api-client';

export interface MeterGroupAssignment {
  id: string;
  organization_id: string;
  meter_id: string;
  meter_group_id: string;
  assigned_date: string;
  assigned_by?: string;
  is_primary: boolean;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
  meters?: {
    id: string;
    meter_number: string;
    serial_number: string;
    meter_type: string;
    status: string;
    manufacturer?: string;
    model?: string;
  };
}

export const useMeterGroupAssignments = (meterGroupId?: string) => {
  const [assignments, setAssignments] = useState<MeterGroupAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMicroservice, setUseMicroservice] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  const fetchAssignments = async () => {
    if (!meterGroupId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (useMicroservice) {
        try {
          const data = await metersApi.assignments.getForGroup(meterGroupId);
          setAssignments(data || []);
          return;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('meter_group_assignments')
        .select('*')
        .eq('meter_group_id', meterGroupId)
        .order('assigned_date', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        return;
      }

      // Fetch meter details for all assigned meter_ids
      const meterIds = assignmentsData.map((a: any) => a.meter_id);
      const { data: metersData, error: metersError } = await supabase
        .from('meters')
        .select('id, meter_number, serial_number, meter_type, status, manufacturer, model')
        .in('id', meterIds);

      if (metersError) throw metersError;

      // Combine the data
      const combinedData = assignmentsData.map((assignment: any) => ({
        ...assignment,
        meters: metersData?.find((m: any) => m.id === assignment.meter_id),
      }));

      setAssignments(combinedData as MeterGroupAssignment[]);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignMeter = async (meterId: string, isPrimary: boolean = false, notes?: string) => {
    if (!meterGroupId) return;

    try {
      if (useMicroservice) {
        try {
          const data = await metersApi.assignments.create(meterGroupId, {
            meter_id: meterId,
            is_primary: isPrimary,
            notes,
          });
          toast({
            title: "Success",
            description: "Meter assigned to group successfully",
          });
          await fetchAssignments();
          return data;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { data, error } = await supabase
        .from('meter_group_assignments')
        .insert([{
          meter_id: meterId,
          meter_group_id: meterGroupId,
          is_primary: isPrimary,
          notes,
          organization_id: currentOrganization?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter assigned to group successfully",
      });

      await fetchAssignments();
      return data;
    } catch (error: any) {
      console.error('Error assigning meter:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const unassignMeter = async (assignmentId: string) => {
    try {
      if (useMicroservice) {
        try {
          await metersApi.assignments.delete(assignmentId);
          toast({
            title: "Success",
            description: "Meter removed from group successfully",
          });
          await fetchAssignments();
          return;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { error } = await supabase
        .from('meter_group_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter removed from group successfully",
      });

      await fetchAssignments();
    } catch (error: any) {
      console.error('Error unassigning meter:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (meterGroupId) {
      fetchAssignments();
    }
  }, [meterGroupId]);

  return {
    assignments,
    loading,
    refetch: fetchAssignments,
    assignMeter,
    unassignMeter,
  };
};