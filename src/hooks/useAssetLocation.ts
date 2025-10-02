import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Asset Location Hook
 * 
 * Fetches complete hierarchy path for an asset, including all parent nodes
 * and their level information (name, icon, color, order)
 */

export interface HierarchyPathLevel {
  id: string;
  name: string;
  levelName: string;
  levelOrder: number;
  icon?: string;
  color?: string;
  properties?: Record<string, any>;
}

export interface AssetLocation {
  fullPath: string;
  levels: HierarchyPathLevel[];
  currentLocation: {
    id: string;
    name: string;
    levelName: string;
  } | null;
}

export function useAssetLocation(assetId: string) {
  const [location, setLocation] = useState<AssetLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) {
      setLoading(false);
      return;
    }

    const fetchAssetLocation = async () => {
      try {
        setLoading(true);
        
        // Get asset's hierarchy_node_id
        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .select('hierarchy_node_id')
          .eq('id', assetId)
          .single();

        if (assetError) throw assetError;
        
        if (!asset?.hierarchy_node_id) {
          setLocation({
            fullPath: '',
            levels: [],
            currentLocation: null
          });
          setLoading(false);
          return;
        }

        // Fetch the complete hierarchy path by recursively getting parents
        const hierarchyPath: HierarchyPathLevel[] = [];
        let currentNodeId: string | null = asset.hierarchy_node_id;

        while (currentNodeId) {
          const { data: node, error: nodeError } = await supabase
            .from('hierarchy_nodes')
            .select(`
              id,
              name,
              parent_id,
              properties,
              hierarchy_levels!hierarchy_level_id (
                name,
                level_order,
                icon_name,
                color_code
              )
            `)
            .eq('id', currentNodeId)
            .single();

          if (nodeError) throw nodeError;

          if (node) {
            const levelInfo = Array.isArray(node.hierarchy_levels) 
              ? node.hierarchy_levels[0] 
              : node.hierarchy_levels;

            hierarchyPath.unshift({
              id: node.id,
              name: node.name,
              levelName: levelInfo?.name || 'Unknown Level',
              levelOrder: levelInfo?.level_order || 0,
              icon: levelInfo?.icon_name,
              color: levelInfo?.color_code,
              properties: typeof node.properties === 'string' 
                ? JSON.parse(node.properties) 
                : (node.properties as Record<string, any>) || {}
            });

            currentNodeId = node.parent_id;
          } else {
            currentNodeId = null;
          }
        }

        // Build full path string
        const fullPath = hierarchyPath.map(level => level.name).join(' > ');

        // Get current location (last item in hierarchy)
        const currentLocation = hierarchyPath.length > 0 
          ? {
              id: hierarchyPath[hierarchyPath.length - 1].id,
              name: hierarchyPath[hierarchyPath.length - 1].name,
              levelName: hierarchyPath[hierarchyPath.length - 1].levelName
            }
          : null;

        setLocation({
          fullPath,
          levels: hierarchyPath,
          currentLocation
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asset location');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetLocation();
  }, [assetId]);

  return {
    location,
    loading,
    error
  };
}
