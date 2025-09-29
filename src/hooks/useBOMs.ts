import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BOM {
  id: string;
  name: string;
  version: string;
  description?: string;
  bom_type: 'manufacturing' | 'maintenance' | 'spare_parts';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BOMItem {
  id: string;
  bom_id: string;
  item_name: string;
  item_number?: string;
  description?: string;
  quantity: number;
  unit: string;
  item_type: 'part' | 'material' | 'tool' | 'consumable';
  cost_per_unit?: number;
  lead_time_days?: number;
  supplier?: string;
  notes?: string;
  parent_item_id?: string;
  level: number;
  inventory_item_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetBOM {
  id: string;
  asset_id: string;
  bom_id: string;
  assigned_date: string;
  assigned_by?: string;
  is_primary: boolean;
  bom?: BOM;
}

export const useBOMs = () => {
  const [boms, setBOMs] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBOMs(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch BOMs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBOM = async (bomData: Omit<BOM, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .insert([bomData])
        .select()
        .single();

      if (error) throw error;
      
      setBOMs(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "BOM created successfully",
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create BOM';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateBOM = async (id: string, updates: Partial<BOM>) => {
    try {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBOMs(prev => prev.map(bom => bom.id === id ? data : bom));
      toast({
        title: "Success",
        description: "BOM updated successfully",
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update BOM';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteBOM = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bill_of_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBOMs(prev => prev.filter(bom => bom.id !== id));
      toast({
        title: "Success",
        description: "BOM deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete BOM';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  return {
    boms,
    loading,
    error,
    refetch: fetchBOMs,
    addBOM,
    updateBOM,
    deleteBOM,
  };
};

export const useBOMItems = (bomId?: string) => {
  const [items, setItems] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBOMItems = async () => {
    if (!bomId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bom_items')
        .select('*')
        .eq('bom_id', bomId)
        .order('level', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch BOM items';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBOMItem = async (itemData: Omit<BOMItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('bom_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "BOM item added successfully",
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add BOM item';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateBOMItem = async (id: string, updates: Partial<BOMItem>) => {
    try {
      const { data, error } = await supabase
        .from('bom_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "BOM item updated successfully",
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update BOM item';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteBOMItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bom_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "BOM item deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete BOM item';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchBOMItems();
  }, [bomId]);

  return {
    items,
    loading,
    error,
    refetch: fetchBOMItems,
    addBOMItem,
    updateBOMItem,
    deleteBOMItem,
  };
};

export const useAssetBOMs = (assetId?: string) => {
  const [assetBOMs, setAssetBOMs] = useState<AssetBOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssetBOMs = async () => {
    if (!assetId) {
      setAssetBOMs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('asset_boms')
        .select(`
          *,
          bom:bill_of_materials(*)
        `)
        .eq('asset_id', assetId)
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      setAssetBOMs(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch asset BOMs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignBOMToAsset = async (bomId: string, isPrimary = false) => {
    if (!assetId) return;

    try {
      const { data, error } = await supabase
        .from('asset_boms')
        .insert([{
          asset_id: assetId,
          bom_id: bomId,
          is_primary: isPrimary,
        }])
        .select(`
          *,
          bom:bill_of_materials(*)
        `)
        .single();

      if (error) throw error;
      
      setAssetBOMs(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "BOM assigned to asset successfully",
      });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign BOM to asset';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const unassignBOMFromAsset = async (assetBOMId: string) => {
    try {
      const { error } = await supabase
        .from('asset_boms')
        .delete()
        .eq('id', assetBOMId);

      if (error) throw error;

      setAssetBOMs(prev => prev.filter(assetBOM => assetBOM.id !== assetBOMId));
      toast({
        title: "Success",
        description: "BOM unassigned from asset successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unassign BOM from asset';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchAssetBOMs();
  }, [assetId]);

  return {
    assetBOMs,
    loading,
    error,
    refetch: fetchAssetBOMs,
    assignBOMToAsset,
    unassignBOMFromAsset,
  };
};