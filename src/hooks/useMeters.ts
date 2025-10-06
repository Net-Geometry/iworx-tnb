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
  const [useMicroservice, setUseMicroservice] = useState(true);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchMeters = async () => {
    try {
      setLoading(true);

      if (useMicroservice) {
        try {
          const data = await metersApi.getAll();
          setMeters(data || []);
          return;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      let query = (supabase as any).from('meters_service.meters').select(`
        *,
        unit:unit_id (
          id,
          name,
          abbreviation
        )
      `);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match Meter type, handling Json types and nested relations
      const transformedData = (data || []).map(meter => ({
        ...meter,
        coordinates: meter.coordinates ? (meter.coordinates as any) : undefined,
        unit: meter.unit && typeof meter.unit === 'object' && !Array.isArray(meter.unit) && 'id' in meter.unit ? meter.unit : undefined,
      })) as Meter[];
      
      setMeters(transformedData);
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
      if (useMicroservice) {
        try {
          const data = await metersApi.create(meterData);
          toast({
            title: "Success",
            description: "Meter registered successfully",
          });
          await fetchMeters();
          return data;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { data, error } = await (supabase as any)
        .from('meters_service.meters')
        .insert([{
          ...meterData,
          organization_id: currentOrganization?.id
        }])
        .select()
        .single();

      if (error) throw error;

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
      if (useMicroservice) {
        try {
          const data = await metersApi.update(id, meterData);
          toast({
            title: "Success",
            description: "Meter updated successfully",
          });
          await fetchMeters();
          return data;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { unit, location, ...cleanData } = meterData;
      
      const { data, error } = await (supabase as any)
        .from('meters_service.meters')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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
      if (useMicroservice) {
        try {
          await metersApi.delete(id);
          toast({
            title: "Success",
            description: "Meter deleted successfully",
          });
          await fetchMeters();
          return;
        } catch (error) {
          console.warn('Meters microservice unavailable, falling back to direct query', error);
          setUseMicroservice(false);
        }
      }

      const { error } = await (supabase as any)
        .from('meters_service.meters')
        .delete()
        .eq('id', id);

      if (error) throw error;

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