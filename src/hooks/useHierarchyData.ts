import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HierarchyLevel {
  id: string;
  name: string;
  level_order: number;
  icon_name: string;
  color_code: string;
  parent_level_id?: string;
  custom_properties_schema: any;
  is_active: boolean;
}

export interface HierarchyNode {
  id: string;
  name: string;
  hierarchy_level_id: string;
  parent_id?: string;
  properties: Record<string, any>;
  status: string;
  asset_count: number;
  path?: string;
  children?: (HierarchyNode | HierarchyAsset)[];
  level_info?: HierarchyLevel;
  nodeType: 'node';
}

export interface HierarchyAsset {
  id: string;
  name: string;
  asset_number?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  status: 'operational' | 'maintenance' | 'out_of_service' | 'decommissioned';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  health_score: number;
  parent_asset_id?: string;
  hierarchy_node_id?: string;
  children?: HierarchyAsset[];
  nodeType: 'asset';
}

export function useHierarchyLevels() {
  const [levels, setLevels] = useState<HierarchyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('hierarchy_levels')
        .select('*')
        .eq('is_active', true)
        .order('level_order');

      if (error) throw error;
      setLevels(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hierarchy levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const addLevel = async (levelData: Omit<HierarchyLevel, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('hierarchy_levels')
        .insert([levelData])
        .select()
        .single();

      if (error) throw error;
      await fetchLevels(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add hierarchy level');
    }
  };

  const updateLevel = async (id: string, updates: Partial<HierarchyLevel>) => {
    try {
      const { data, error } = await supabase
        .from('hierarchy_levels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchLevels(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update hierarchy level');
    }
  };

  const deleteLevel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hierarchy_levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLevels(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete hierarchy level');
    }
  };

  return {
    levels,
    loading,
    error,
    refetch: fetchLevels,
    addLevel,
    updateLevel,
    deleteLevel
  };
}

export function useHierarchyNodes() {
  const [nodes, setNodes] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      // Fetch hierarchy nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('hierarchy_nodes')
        .select(`
          *,
          hierarchy_levels!hierarchy_level_id (
            id,
            name,
            level_order,
            icon_name,
            color_code
          )
        `)
        .order('name');

      if (nodesError) throw nodesError;

      // Fetch assets with hierarchy relationships
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_number,
          type,
          category,
          subcategory,
          status,
          criticality,
          health_score,
          parent_asset_id,
          hierarchy_node_id
        `)
        .order('name');

      if (assetsError) throw assetsError;
      
      // Build tree structure
      const nodeMap = new Map<string, HierarchyNode>();
      const assetMap = new Map<string, HierarchyAsset>();
      const rootNodes: HierarchyNode[] = [];

      // First pass: create all nodes
      (nodesData || []).forEach(node => {
        const hierarchyNode: HierarchyNode = {
          ...node,
          nodeType: 'node' as const,
          asset_count: 0, // Will be calculated
          properties: typeof node.properties === 'string' 
            ? JSON.parse(node.properties) 
            : node.properties || {},
          children: []
        };
        nodeMap.set(node.id, hierarchyNode);
      });

      // Second pass: create all assets
      (assetsData || []).forEach(asset => {
        const hierarchyAsset: HierarchyAsset = {
          ...asset,
          nodeType: 'asset' as const,
          status: asset.status as HierarchyAsset['status'],
          criticality: asset.criticality as HierarchyAsset['criticality'],
          children: []
        };
        assetMap.set(asset.id, hierarchyAsset);
      });

      // Third pass: build asset parent-child relationships
      (assetsData || []).forEach(asset => {
        const hierarchyAsset = assetMap.get(asset.id)!;
        if (asset.parent_asset_id) {
          const parentAsset = assetMap.get(asset.parent_asset_id);
          if (parentAsset) {
            parentAsset.children = parentAsset.children || [];
            parentAsset.children.push(hierarchyAsset);
          }
        }
      });

      // Fourth pass: attach assets to hierarchy nodes
      (assetsData || []).forEach(asset => {
        const hierarchyAsset = assetMap.get(asset.id)!;
        
        // Only attach root-level assets (those without parents) to hierarchy nodes
        if (!asset.parent_asset_id && asset.hierarchy_node_id) {
          const node = nodeMap.get(asset.hierarchy_node_id);
          if (node) {
            node.children = node.children || [];
            node.children.push(hierarchyAsset);
          }
        }
      });

      // Fifth pass: build node relationships and calculate asset counts
      (nodesData || []).forEach(node => {
        const hierarchyNode = nodeMap.get(node.id)!;
        
        // Calculate total asset count (including nested assets)
        const countAssetsRecursively = (items: (HierarchyNode | HierarchyAsset)[]): number => {
          return items.reduce((count, item) => {
            if (item.nodeType === 'asset') {
              return count + 1 + countAssetsRecursively(item.children || []);
            } else {
              return count + countAssetsRecursively(item.children || []);
            }
          }, 0);
        };
        
        hierarchyNode.asset_count = countAssetsRecursively(hierarchyNode.children || []);
        
        // Build node hierarchy
        if (node.parent_id) {
          const parent = nodeMap.get(node.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(hierarchyNode);
          }
        } else {
          rootNodes.push(hierarchyNode);
        }
      });

      setNodes(rootNodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hierarchy nodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const addNode = async (nodeData: Omit<HierarchyNode, 'id' | 'children' | 'level_info'>) => {
    try {
      console.log('Adding new node:', nodeData);
      const { data, error } = await supabase
        .from('hierarchy_nodes')
        .insert([nodeData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      console.log('Insert successful:', data);
      await fetchNodes(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Add node error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add hierarchy node');
    }
  };

  const updateNode = async (id: string, updates: Partial<HierarchyNode>) => {
    try {
      console.log('Updating node with ID:', id, 'Updates:', updates);
      const { data, error } = await supabase
        .from('hierarchy_nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      console.log('Update successful:', data);
      await fetchNodes(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Update node error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update hierarchy node');
    }
  };

  const deleteNode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hierarchy_nodes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchNodes(); // Refresh the list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete hierarchy node');
    }
  };

  return {
    nodes,
    loading,
    error,
    refetch: fetchNodes,
    addNode,
    updateNode,
    deleteNode
  };
}