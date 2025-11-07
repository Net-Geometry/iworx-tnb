import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { useAssetDocuments } from '@/hooks/useAssetDocuments';
import { useAuth } from '@/contexts/AuthContext';
import { Upload } from 'lucide-react';

interface DocumentUploadSectionProps {
  assetId: string;
}

/**
 * Component for uploading documents directly from the asset detail page
 * Immediately saves uploaded files to the database
 */
export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ assetId }) => {
  const { addAssetDocument, fetchAssetDocuments } = useAssetDocuments(assetId);
  const { currentOrganization } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUploaded = async (url: string, fileName: string) => {
    if (!currentOrganization) return;

    setUploading(true);
    try {
      // Extract file extension
      const fileType = fileName.split('.').pop();

      // Save document to database immediately
      await addAssetDocument({
        asset_id: assetId,
        file_name: fileName,
        file_path: url,
        file_type: fileType,
      });

      // Refresh the document list
      await fetchAssetDocuments(assetId);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-foreground">Upload Documents</h4>
      </div>
      <FileUpload
        bucket="asset-documents"
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
        maxSize={10 * 1024 * 1024} // 10MB
        currentFile=""
        label="Drop files here or click to browse"
        onFileUploaded={handleFileUploaded}
        onFileRemoved={() => {}}
      />
      {uploading && (
        <p className="text-xs text-muted-foreground">Saving document...</p>
      )}
    </div>
  );
};
