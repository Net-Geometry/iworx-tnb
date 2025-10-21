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

      // Call the secure public function
      const { data, error } = await supabase.rpc('get_public_asset_info', {
        p_asset_id: assetId,
      });

      if (error) {
        console.error('[usePublicAsset] Error fetching public asset:', error);
        toast({
          title: 'Error',
          description: 'Failed to load asset information',
          variant: 'destructive',
        });
        throw error;
      }

      // The function returns an array, get first result
      const assetData = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!assetData) {
        console.warn('[usePublicAsset] Asset not found or not publicly accessible');
        return null;
      }

      // Log the access for audit purposes
      try {
        await supabase.from('public_asset_access_log').insert({
          asset_id: assetId,
          ip_address: null, // Will be null on client side
          user_agent: navigator.userAgent,
          referer: document.referrer || null,
        });
      } catch (logError) {
        console.error('[usePublicAsset] Failed to log access:', logError);
        // Don't fail the request if logging fails
      }

      return assetData as PublicAssetData;
    },
    enabled: !!assetId,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
};
