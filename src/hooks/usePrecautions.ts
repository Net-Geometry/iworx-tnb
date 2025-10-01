import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { safetyApi } from '@/services/api-client';
import type { Database } from '@/integrations/supabase/types';

type SafetyPrecaution = Database['public']['Tables']['safety_precautions']['Row'];
type SafetyPrecautionInsert = Database['public']['Tables']['safety_precautions']['Insert'];
type SafetyPrecautionUpdate = Database['public']['Tables']['safety_precautions']['Update'];

export interface PrecautionFilters {
  category?: string;
  severity?: string;
  status?: string;
  search?: string;
}

export const usePrecautions = () => {
  const [precautions, setPrecautions] = useState<SafetyPrecaution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchPrecautions = async (filters?: PrecautionFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Try microservice first
      try {
        const data = await safetyApi.precautions.getAll(filters);
        setPrecautions(data || []);
        return;
      } catch (apiError) {
        console.warn('Safety microservice unavailable, falling back to direct DB access:', apiError);
      }

      // Fallback to direct Supabase query
      let query = supabase
        .from('safety_precautions')
        .select('*')
        .order('updated_at', { ascending: false });

      // Filter by organization unless user has cross-project access
      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity_level', filters.severity as 'critical' | 'high' | 'medium' | 'low');
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'active' | 'under_review' | 'archived');
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,precaution_code.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPrecautions(data || []);
    } catch (error: any) {
      console.error('Error fetching precautions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addPrecaution = async (precautionData: SafetyPrecautionInsert) => {
    try {
      // Try microservice first
      try {
        const data = await safetyApi.precautions.create(precautionData);
        toast({
          title: "Success",
          description: "Safety precaution created successfully",
        });
        await fetchPrecautions();
        return data;
      } catch (apiError) {
        console.warn('Safety microservice unavailable, falling back to direct DB access:', apiError);
      }

      // Fallback to direct Supabase query
      const dataWithOrg = {
        ...precautionData,
        organization_id: currentOrganization?.id
      };

      const { data, error } = await supabase
        .from('safety_precautions')
        .insert([dataWithOrg])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Safety precaution created successfully",
      });

      await fetchPrecautions();
      return data;
    } catch (error: any) {
      console.error('Error adding precaution:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePrecaution = async (id: string, precautionData: SafetyPrecautionUpdate) => {
    try {
      // Try microservice first
      try {
        const data = await safetyApi.precautions.update(id, precautionData);
        toast({
          title: "Success",
          description: "Safety precaution updated successfully",
        });
        await fetchPrecautions();
        return data;
      } catch (apiError) {
        console.warn('Safety microservice unavailable, falling back to direct DB access:', apiError);
      }

      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from('safety_precautions')
        .update(precautionData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Safety precaution updated successfully",
      });

      await fetchPrecautions();
      return data;
    } catch (error: any) {
      console.error('Error updating precaution:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePrecaution = async (id: string) => {
    try {
      // Try microservice first
      try {
        await safetyApi.precautions.delete(id);
        toast({
          title: "Success",
          description: "Safety precaution deleted successfully",
        });
        await fetchPrecautions();
        return;
      } catch (apiError) {
        console.warn('Safety microservice unavailable, falling back to direct DB access:', apiError);
      }

      // Fallback to direct Supabase query
      const { error } = await supabase
        .from('safety_precautions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Safety precaution deleted successfully",
      });

      await fetchPrecautions();
    } catch (error: any) {
      console.error('Error deleting precaution:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementUsageCount = async (id: string) => {
    try {
      // Try microservice first
      try {
        await safetyApi.precautions.incrementUsage(id);
        await fetchPrecautions();
        return;
      } catch (apiError) {
        console.warn('Safety microservice unavailable, falling back to direct DB access:', apiError);
      }

      // Fallback to direct Supabase query
      const { data: currentData, error: fetchError } = await supabase
        .from('safety_precautions')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newUsageCount = (currentData?.usage_count || 0) + 1;

      const { error } = await supabase
        .from('safety_precautions')
        .update({ usage_count: newUsageCount })
        .eq('id', id);

      if (error) throw error;

      // Refresh data to show updated count
      await fetchPrecautions();
    } catch (error: any) {
      console.error('Error updating usage count:', error);
    }
  };

  useEffect(() => {
    if (currentOrganization || hasCrossProjectAccess) {
      fetchPrecautions();
    }
  }, [currentOrganization?.id, hasCrossProjectAccess]);

  return {
    precautions,
    loading,
    error,
    refetch: fetchPrecautions,
    addPrecaution,
    updatePrecaution,
    deletePrecaution,
    incrementUsageCount
  };
};