import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  // New comprehensive fields
  category?: string;
  subcategory?: string;
  parent_asset_id?: string;
  purchase_cost?: number;
  warranty_expiry_date?: string;
  asset_image_url?: string;
  qr_code_data?: string;
  // Joined data from hierarchy
  hierarchy_path?: string;
  location?: string;
  organization_id: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assets with hierarchy information
      let query = supabase
        .from('assets')
        .select(`
          *,
          hierarchy_nodes!hierarchy_node_id (
            id,
            name,
            path
          )
        `);

      // Filter by organization unless user has cross-project access
      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

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

  const addAsset = async (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'hierarchy_path' | 'location' | 'organization_id'>) => {
    try {
      const dataWithOrg = {
        ...assetData,
        organization_id: currentOrganization?.id
      };

      const { data, error } = await supabase
        .from('assets')
        .insert([dataWithOrg])
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
    if (currentOrganization || hasCrossProjectAccess) {
      fetchAssets();
    }
  }, [currentOrganization?.id, hasCrossProjectAccess]);

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