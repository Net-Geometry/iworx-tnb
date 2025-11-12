import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { metersApi } from '@/services/api-client';

export interface Meter {
  id: string;
  organization_id: string;
  meter_number: string;
  serial_number: string;
  description?: string;
  meter_type: 'revenue' | 'monitoring' | 'protection' | 'power_quality';
  manufacturer?: string;
  model?: string;
  accuracy_class?: string;
  voltage_rating?: number;
  current_rating?: number;
  phase_type?: 'single' | 'three';
  installation_date?: string;
  installation_location?: string;
  coordinates?: { lat: number; lng: number };
  location?: any; // PostGIS GEOMETRY(POINT)
  last_calibration_date?: string;
  next_calibration_date?: string;
  calibration_certificate_number?: string;
  meter_constant?: number;
  multiplier?: number;
  status: 'active' | 'inactive' | 'faulty' | 'retired';
  unit_id?: number;
  unit?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  last_reading?: number;
  last_reading_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useMeters = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const data = await metersApi.getAll();
      setMeters(data || []);
    } catch (error: any) {
      console.error('Error fetching meters:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeter = async (meterData: Omit<Meter, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'location'>) => {
    try {
      const data = await metersApi.create(meterData);
      toast({
        title: "Success",
        description: "Meter registered successfully",
      });
      await fetchMeters();
      return data;
    } catch (error: any) {
      console.error('Error adding meter:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMeter = async (id: string, meterData: Partial<Meter>) => {
    try {
      const data = await metersApi.update(id, meterData);
      toast({
        title: "Success",
        description: "Meter updated successfully",
      });
      await fetchMeters();
      return data;
    } catch (error: any) {
      console.error('Error updating meter:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMeter = async (id: string) => {
    try {
      await metersApi.delete(id);
      toast({
        title: "Success",
        description: "Meter deleted successfully",
      });
      await fetchMeters();
    } catch (error: any) {
      console.error('Error deleting meter:', error);
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
      fetchMeters();
    }
  }, [currentOrganization?.id, hasCrossProjectAccess]);

  return {
    meters,
    loading,
    refetch: fetchMeters,
    addMeter,
    updateMeter,
    deleteMeter,
  };
};