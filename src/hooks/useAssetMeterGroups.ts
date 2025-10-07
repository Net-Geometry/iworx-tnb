import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AssetMeterGroup {
  id: string;
  organization_id: string;
  asset_id: string;
  meter_group_id: string;
  assigned_date: string;
  assigned_by?: string;
  purpose?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useAssetMeterGroups = (assetId?: string) => {
  const [assetMeterGroups, setAssetMeterGroups] = useState<AssetMeterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  const fetchAssetMeterGroups = async () => {
    if (!assetId) {
      setAssetMeterGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try nested query first (optimal performance with FK)
      const { data, error } = await supabase
        .from('asset_meter_groups')
        .select(`
          *,
          meter_groups (
            id,
            name,
            group_number,
            group_type,
            description
          )
        `)
        .eq('asset_id', assetId)
        .order('assigned_date', { ascending: false });

      if (error) {
        // Fallback: fetch separately and join manually
        console.warn('Nested query failed, using fallback:', error.message);
        
        const { data: amgData, error: amgError } = await supabase
          .from('asset_meter_groups')
          .select('*')
          .eq('asset_id', assetId)
          .order('assigned_date', { ascending: false });

        if (amgError) throw amgError;

        if (!amgData || amgData.length === 0) {
          setAssetMeterGroups([]);
          return;
        }

        // Fetch related meter groups
        const meterGroupIds = amgData.map(amg => amg.meter_group_id);
        const { data: mgData, error: mgError } = await supabase
          .from('meter_groups')
          .select('id, name, group_number, group_type, description')
          .in('id', meterGroupIds);

        if (mgError) throw mgError;

        // Manual join
        const joinedData = amgData.map(amg => ({
          ...amg,
          meter_groups: mgData?.find(mg => mg.id === amg.meter_group_id) || null
        }));

        setAssetMeterGroups(joinedData);
      } else {
        setAssetMeterGroups(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching asset meter groups:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignMeterGroup = async (meterGroupId: string, purpose?: string, notes?: string) => {
    if (!assetId) return;

    try {
      const { data, error } = await supabase
        .from('asset_meter_groups')
        .insert([{
          asset_id: assetId,
          meter_group_id: meterGroupId,
          purpose,
          notes,
          organization_id: currentOrganization?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter group assigned to asset successfully",
      });

      await fetchAssetMeterGroups();
      return data;
    } catch (error: any) {
      console.error('Error assigning meter group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const unassignMeterGroup = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('asset_meter_groups')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter group removed from asset successfully",
      });

      await fetchAssetMeterGroups();
    } catch (error: any) {
      console.error('Error unassigning meter group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (assetId) {
      fetchAssetMeterGroups();
    }
  }, [assetId]);

  return {
    assetMeterGroups,
    loading,
    refetch: fetchAssetMeterGroups,
    assignMeterGroup,
    unassignMeterGroup,
  };
};