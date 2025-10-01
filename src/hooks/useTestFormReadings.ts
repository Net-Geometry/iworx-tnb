import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MeterReading {
  id: string;
  work_order_id: string;
  meter_group_id: string;
  reading_value: number;
  reading_date: string;
  recorded_by?: string;
  notes?: string;
  is_validated: boolean;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook for managing test form meter readings
 */
export const useTestFormReadings = (workOrderId: string) => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_order_meter_readings')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('reading_date', { ascending: false });

      if (error) throw error;
      setReadings(data || []);
    } catch (error: any) {
      console.error('Error fetching meter readings:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReading = async (
    meterGroupId: string,
    readingValue: number,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('work_order_meter_readings')
        .insert([{
          work_order_id: workOrderId,
          meter_group_id: meterGroupId,
          reading_value: readingValue,
          notes,
          organization_id: currentOrganization?.id,
          recorded_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter reading saved successfully",
      });

      await fetchReadings();
      return data;
    } catch (error: any) {
      console.error('Error saving meter reading:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReading = async (
    readingId: string,
    readingValue: number,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('work_order_meter_readings')
        .update({
          reading_value: readingValue,
          notes,
        })
        .eq('id', readingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter reading updated successfully",
      });

      await fetchReadings();
    } catch (error: any) {
      console.error('Error updating meter reading:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (workOrderId) {
      fetchReadings();
    }
  }, [workOrderId]);

  return {
    readings,
    loading,
    refetch: fetchReadings,
    saveReading,
    updateReading,
  };
};
