import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PublicAssetData {
  id: string;
  name: string;
  asset_number: string;
  type: string | null;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  location: string | null;
  status: string | null;
  asset_image_url: string | null;
  qr_code_data: string | null;
  allow_public_access: boolean;
  organization_id: string;
}

/**
 * Hook to fetch public asset information without authentication
 * Uses the secure get_public_asset_info function which only returns non-sensitive data
 */
export const usePublicAsset = (assetId: string | undefined) => {
  return useQuery({
    queryKey: ['public-asset', assetId],
    queryFn: async (): Promise<PublicAssetData | null> => {
      if (!assetId) return null;

      console.log('[usePublicAsset] Fetching public asset info for:', assetId);

      // TODO: Database setup required for public asset access
      // This feature requires: get_public_asset_info RPC function and public_asset_access_log table
      console.warn('[usePublicAsset] Public asset feature not yet configured');
      return null;
    },
    enabled: !!assetId,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
};
