import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AssetDocument {
  id: string;
  asset_id: string;
  organization_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  uploaded_at: string;
}

export const useAssetDocuments = (assetId?: string) => {
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentOrganization } = useAuth();

  // Fetch documents for a specific asset
  const fetchAssetDocuments = async (id: string) => {
    if (!id || !currentOrganization) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('asset_documents')
        .select('*')
        .eq('asset_id', id)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching asset documents:', err);
      setError(err.message);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Add a document record
  const addAssetDocument = async (documentData: {
    asset_id: string;
    file_name: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
  }) => {
    if (!currentOrganization) {
      toast.error('No organization selected');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('asset_documents')
        .insert({
          ...documentData,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Document saved successfully');
      
      // Refresh the list if we're viewing this asset
      if (assetId === documentData.asset_id) {
        await fetchAssetDocuments(documentData.asset_id);
      }

      return data;
    } catch (err: any) {
      console.error('Error adding document:', err);
      toast.error('Failed to save document record');
      return null;
    }
  };

  // Delete a document (both record and file)
  const deleteAssetDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('asset-documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('asset_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      
      // Refresh the list
      if (assetId) {
        await fetchAssetDocuments(assetId);
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
      return false;
    }
  };

  // Auto-fetch on mount if assetId is provided
  useEffect(() => {
    if (assetId) {
      fetchAssetDocuments(assetId);
    }
  }, [assetId, currentOrganization?.id]);

  return {
    documents,
    loading,
    error,
    fetchAssetDocuments,
    addAssetDocument,
    deleteAssetDocument,
  };
};
