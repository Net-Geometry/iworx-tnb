/**
 * Model 3D Upload Component
 * 
 * Handles GLB/GLTF file uploads to Supabase Storage for 3D asset models
 */

import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Model3DUploadProps {
  assetId?: string;
  currentFileUrl?: string;
  onFileUploaded: (url: string, filename: string) => void;
  onFileRemoved: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FORMATS = ['.glb', '.gltf'];

export function Model3DUpload({
  assetId,
  currentFileUrl,
  onFileUploaded,
  onFileRemoved
}: Model3DUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { currentOrganization } = useAuth();
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_FORMATS.includes(extension)) {
      return `Invalid file format. Please upload ${ACCEPTED_FORMATS.join(', ')} files only.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!currentOrganization?.id) {
      setError('Organization context required for upload');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = assetId 
        ? `${assetId}_${timestamp}.${extension}`
        : `temp_${timestamp}.${extension}`;
      const filePath = `${currentOrganization.id}/${filename}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('asset-3d-models')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('asset-3d-models')
        .getPublicUrl(filePath);

      setProgress(100);
      onFileUploaded(publicUrl, file.name);
      
      toast({
        title: "3D Model Uploaded",
        description: `${file.name} uploaded successfully`,
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message || 'Failed to upload 3D model',
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!currentFileUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentFileUrl.split('/asset-3d-models/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('asset-3d-models')
          .remove([filePath]);
      }

      onFileRemoved();
      toast({
        title: "Model Removed",
        description: "3D model removed successfully",
      });
    } catch (err: any) {
      console.error('Remove error:', err);
      toast({
        variant: "destructive",
        title: "Remove Failed",
        description: err.message || 'Failed to remove 3D model',
      });
    }
  };

  if (currentFileUrl) {
    return (
      <div className="border rounded-lg p-4 bg-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">3D Model Uploaded</p>
              <p className="text-xs text-muted-foreground">GLB/GLTF format</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Drop 3D model here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              GLB or GLTF format, max {MAX_FILE_SIZE / (1024 * 1024)}MB
            </p>
          </div>
          <input
            type="file"
            id="model-upload"
            className="hidden"
            accept={ACCEPTED_FORMATS.join(',')}
            onChange={handleFileInput}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('model-upload')?.click()}
          >
            Browse Files
          </Button>
        </div>
      </div>

      {progress > 0 && progress < 100 && (
        <Progress value={progress} className="h-2" />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
