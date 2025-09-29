import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Asset {
  id: string;
  name: string;
  asset_number?: string;
  type?: string;
  description?: string;
  hierarchy_node_id?: string;
  status: 'operational' | 'maintenance' | 'out_of_service' | 'decommissioned';
  health_score: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;
  // Joined data from hierarchy
  hierarchy_path?: string;
  location?: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assets with hierarchy information
      const { data, error: fetchError } = await supabase
        .from('assets')
        .select(`
          *,
          hierarchy_nodes!hierarchy_node_id (
            id,
            name,
            path
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to include hierarchy path as location
      const transformedAssets: Asset[] = (data || []).map(asset => ({
        ...asset,
        status: asset.status as Asset['status'], // Type assertion for status
        criticality: asset.criticality as Asset['criticality'], // Type assertion for criticality
        location: asset.hierarchy_nodes?.name || 'Unassigned',
        hierarchy_path: asset.hierarchy_nodes?.path || asset.hierarchy_nodes?.name || 'Unassigned'
      }));

      setAssets(transformedAssets);
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAsset = async (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'hierarchy_path' | 'location'>) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset created successfully",
      });

      await fetchAssets(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Error adding asset:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update(assetData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset updated successfully",
      });

      await fetchAssets(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });

      await fetchAssets(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset
  };
};