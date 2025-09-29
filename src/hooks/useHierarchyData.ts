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
  children?: HierarchyNode[];
  level_info?: HierarchyLevel;
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
      const { data, error: fetchError } = await supabase
        .from('hierarchy_nodes')
        .select(`
          *,
          hierarchy_levels!hierarchy_level_id (
            id,
            name,
            level_order,
            icon_name,
            color_code
          ),
          assets!hierarchy_node_id (
            id
          )
        `)
        .order('name');

      if (fetchError) throw fetchError;
      
      // Build tree structure
      const nodeMap = new Map<string, HierarchyNode>();
      const rootNodes: HierarchyNode[] = [];

      // First pass: create all nodes
      (data || []).forEach(node => {
        const hierarchyNode: HierarchyNode = {
          ...node,
          asset_count: node.assets?.length || 0, // Use actual asset count from database
          properties: typeof node.properties === 'string' 
            ? JSON.parse(node.properties) 
            : node.properties || {},
          children: []
        };
        nodeMap.set(node.id, hierarchyNode);
      });

      // Second pass: build relationships
      (data || []).forEach(node => {
        const hierarchyNode = nodeMap.get(node.id)!;
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
      const { data, error } = await supabase
        .from('hierarchy_nodes')
        .insert([nodeData])
        .select()
        .single();

      if (error) throw error;
      await fetchNodes(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add hierarchy node');
    }
  };

  const updateNode = async (id: string, updates: Partial<HierarchyNode>) => {
    try {
      const { data, error } = await supabase
        .from('hierarchy_nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchNodes(); // Refresh the list
      return data;
    } catch (err) {
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