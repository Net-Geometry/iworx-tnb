import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssets, Asset } from '@/hooks/useAssets';
import { useHierarchyNodes } from '@/hooks/useHierarchyData';
import { useAuth } from '@/contexts/AuthContext';
import AssetFormContent from './AssetFormContent';

interface AssetManagementFormProps {
  assetId?: string;
  onClose: () => void;
  mode?: 'modal' | 'page';
}

const AssetManagementForm: React.FC<AssetManagementFormProps> = ({ assetId, onClose, mode = 'modal' }) => {
  const { assets, addAsset, updateAsset } = useAssets();
  const { nodes } = useHierarchyNodes();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    asset_number: '',
    type: '',
    description: '',
    hierarchy_node_id: '',
    status: 'operational' as Asset['status'],
    criticality: 'medium' as Asset['criticality'],
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    // New comprehensive fields
    category: '',
    subcategory: '',
    parent_asset_id: '',
    purchase_cost: '',
    warranty_expiry_date: '',
    asset_image_url: '',
    qr_code_data: '',
    // 3D Model fields
    model_3d_url: '',
    model_3d_scale_x: '1',
    model_3d_scale_y: '1',
    model_3d_scale_z: '1',
    model_3d_rotation_x: '0',
    model_3d_rotation_y: '0',
    model_3d_rotation_z: '0',
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{name: string, url: string}>>([]);

  // Flatten nodes for selection - optimized with useCallback
  const flattenNodes = useCallback((nodeList: any[]): any[] => {
    const flattened: any[] = [];
    
    const addNode = (node: any, depth = 0) => {
      flattened.push({ ...node, depth });
      if (node.children) {
        node.children.forEach((child: any) => addNode(child, depth + 1));
      }
    };
    
    nodeList.forEach(node => addNode(node));
    return flattened;
  }, []);

  const flatNodes = useMemo(() => flattenNodes(nodes), [nodes, flattenNodes]);

  // Load existing asset data if editing - optimized to only run when assetId changes
  const existingAsset = useMemo(() => assets.find(asset => asset.id === assetId), [assets, assetId]);

  useEffect(() => {
    if (existingAsset && assetId) {
      const scale = existingAsset.model_3d_scale || { x: 1, y: 1, z: 1 };
      const rotation = existingAsset.model_3d_rotation || { x: 0, y: 0, z: 0 };
      
      setFormData({
        name: existingAsset.name,
        asset_number: existingAsset.asset_number || '',
        type: existingAsset.type || '',
        description: existingAsset.description || '',
        hierarchy_node_id: existingAsset.hierarchy_node_id || '',
        status: existingAsset.status,
        criticality: existingAsset.criticality,
        manufacturer: existingAsset.manufacturer || '',
        model: existingAsset.model || '',
        serial_number: existingAsset.serial_number || '',
        purchase_date: existingAsset.purchase_date || '',
        category: existingAsset.category || '',
        subcategory: existingAsset.subcategory || '',
        parent_asset_id: existingAsset.parent_asset_id || '',
        purchase_cost: existingAsset.purchase_cost?.toString() || '',
        warranty_expiry_date: existingAsset.warranty_expiry_date || '',
        asset_image_url: existingAsset.asset_image_url || '',
        qr_code_data: existingAsset.qr_code_data || '',
        model_3d_url: existingAsset.model_3d_url || '',
        model_3d_scale_x: scale.x.toString(),
        model_3d_scale_y: scale.y.toString(),
        model_3d_scale_z: scale.z.toString(),
        model_3d_rotation_x: rotation.x.toString(),
        model_3d_rotation_y: rotation.y.toString(),
        model_3d_rotation_z: rotation.z.toString(),
      });
    }
  }, [existingAsset, assetId]);

  // Generate QR code data when asset name or number changes - optimized with debouncing effect
  useEffect(() => {
    if (formData.name && !assetId) {
      const timeout = setTimeout(() => {
        const qrData = JSON.stringify({
          name: formData.name,
          tag: formData.asset_number,
          id: 'will-be-generated'
        });
        setFormData(prev => ({ ...prev, qr_code_data: qrData }));
      }, 300); // Debounce to prevent excessive updates

      return () => clearTimeout(timeout);
    }
  }, [formData.name, formData.asset_number, assetId]);

  // Optimized form data change handler
  const handleFormDataChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Optimized documents change handler
  const handleUploadedDocumentsChange = useCallback((docs: Array<{name: string, url: string}>) => {
    setUploadedDocuments(docs);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Exclude individual XYZ fields that don't exist as columns
      const {
        model_3d_scale_x,
        model_3d_scale_y,
        model_3d_scale_z,
        model_3d_rotation_x,
        model_3d_rotation_y,
        model_3d_rotation_z,
        ...cleanFormData
      } = formData;
      
      const assetData = {
        ...cleanFormData,
        health_score: existingAsset?.health_score || 100,
        hierarchy_node_id: formData.hierarchy_node_id || null,
        asset_number: formData.asset_number || null,
        type: formData.type || null,
        description: formData.description || null,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        purchase_date: formData.purchase_date || null,
        last_maintenance_date: null,
        next_maintenance_date: null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        parent_asset_id: formData.parent_asset_id || null,
        purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
        warranty_expiry_date: formData.warranty_expiry_date || null,
        asset_image_url: formData.asset_image_url || null,
        qr_code_data: formData.qr_code_data || null,
        model_3d_url: formData.model_3d_url || null,
        model_3d_scale: formData.model_3d_url ? {
          x: parseFloat(formData.model_3d_scale_x) || 1,
          y: parseFloat(formData.model_3d_scale_y) || 1,
          z: parseFloat(formData.model_3d_scale_z) || 1
        } : null,
        model_3d_rotation: formData.model_3d_url ? {
          x: parseFloat(formData.model_3d_rotation_x) || 0,
          y: parseFloat(formData.model_3d_rotation_y) || 0,
          z: parseFloat(formData.model_3d_rotation_z) || 0
        } : null
      };

      if (assetId) {
        await updateAsset(assetId, assetData);
      } else {
        await addAsset(assetData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, assetId, existingAsset?.health_score, updateAsset, addAsset, onClose]);

  if (mode === 'page') {
    return (
      <AssetFormContent
        formData={formData}
        flatNodes={flatNodes}
        assetId={assetId}
        loading={loading}
        uploadedDocuments={uploadedDocuments}
        onFormDataChange={handleFormDataChange}
        onUploadedDocumentsChange={handleUploadedDocumentsChange}
        onSubmit={handleSubmit}
        onClose={onClose}
      />
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assetId ? 'Edit Asset' : 'Create New Asset'}
          </DialogTitle>
        </DialogHeader>
        <AssetFormContent
          formData={formData}
          flatNodes={flatNodes}
          assetId={assetId}
          loading={loading}
          uploadedDocuments={uploadedDocuments}
          onFormDataChange={handleFormDataChange}
          onUploadedDocumentsChange={handleUploadedDocumentsChange}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AssetManagementForm;