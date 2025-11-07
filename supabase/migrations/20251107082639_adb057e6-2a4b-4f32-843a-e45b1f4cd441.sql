-- Make asset-documents bucket public so files can be downloaded directly
UPDATE storage.buckets 
SET public = true 
WHERE id = 'asset-documents';