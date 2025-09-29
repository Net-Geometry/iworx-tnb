import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

  const fetchPrecautions = async (filters?: PrecautionFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('safety_precautions')
        .select('*')
        .order('updated_at', { ascending: false });

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
      const { data, error } = await supabase
        .from('safety_precautions')
        .insert([precautionData])
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
      // Get current usage count first
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
    fetchPrecautions();
  }, []);

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