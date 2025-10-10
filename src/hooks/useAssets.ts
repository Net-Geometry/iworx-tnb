import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { assetApi } from '@/services/api-client';

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
  // 3D Model fields
  model_3d_url?: string;
  model_3d_scale?: { x: number; y: number; z: number };
  model_3d_rotation?: { x: number; y: number; z: number };
}

export const useAssets = (enabled: boolean = true) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use microservice API through API Gateway
      const data = await assetApi.getAssets();

      // Transform data to match Asset interface
      const transformedAssets: Asset[] = (data as any[]).map(asset => ({
        ...asset,
        status: asset.status as Asset['status'],
        criticality: asset.criticality as Asset['criticality'],
      }));

      setAssets(transformedAssets);
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      setError(error.message);
      
      // Fallback to direct Supabase call if microservice fails
      console.log('[useAssets] Falling back to direct database access');
      try {
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

        if (!hasCrossProjectAccess && currentOrganization) {
          query = query.eq('organization_id', currentOrganization.id);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // ✅ OPTIMIZED: Batch fetch all hierarchy nodes with .in() to eliminate N+1 queries
        const nodeIds = [...new Set(data.filter(a => a.hierarchy_node_id).map(a => a.hierarchy_node_id))];
        
        let nodesData: any[] = [];
        if (nodeIds.length > 0) {
          const { data: nodes } = await supabase
            .from('hierarchy_nodes')
            .select('id, name, path')
            .in('id', nodeIds);
          nodesData = nodes || [];
        }

        // Client-side join (fast in-memory operation)
        const transformedAssets: Asset[] = data.map(asset => {
          const nodeData = nodesData.find(n => n.id === asset.hierarchy_node_id);
          
          return {
            ...asset,
            status: asset.status as Asset['status'],
            criticality: asset.criticality as Asset['criticality'],
            location: nodeData ? nodeData.name : 'Unassigned',
            hierarchy_path: nodeData ? (nodeData.path || nodeData.name) : 'Unassigned',
            model_3d_scale: asset.model_3d_scale as any,
            model_3d_rotation: asset.model_3d_rotation as any,
          };
        });

        setAssets(transformedAssets);
        setError(null); // Clear error on successful fallback
      } catch (fallbackError: any) {
        console.error('Fallback also failed:', fallbackError);
        setError(fallbackError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addAsset = async (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'hierarchy_path' | 'location' | 'organization_id'>) => {
    try {
      // Use microservice API
      const data = await assetApi.createAsset(assetData);

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
      // Use microservice API
      const data = await assetApi.updateAsset(id, assetData);

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
      // Use microservice API
      await assetApi.deleteAsset(id);

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
    if (enabled && (currentOrganization || hasCrossProjectAccess)) {
      fetchAssets();
    }
  }, [enabled, currentOrganization?.id, hasCrossProjectAccess]);

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