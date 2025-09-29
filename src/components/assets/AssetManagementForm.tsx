import React, { useState, useEffect } from 'react';
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
import { FileUpload } from './FileUpload';
import { QRCodePreview } from './QRCodePreview';
import { ParentAssetSelect } from './ParentAssetSelect';

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
    last_maintenance_date: '',
    next_maintenance_date: '',
    // New comprehensive fields
    category: '',
    subcategory: '',
    parent_asset_id: '',
    purchase_cost: '',
    warranty_expiry_date: '',
    asset_image_url: '',
    qr_code_data: ''
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{name: string, url: string}>>([]);

  // Flatten nodes for selection
  const flattenNodes = (nodeList: any[]): any[] => {
    const flattened: any[] = [];
    
    const addNode = (node: any, depth = 0) => {
      flattened.push({ ...node, depth });
      if (node.children) {
        node.children.forEach((child: any) => addNode(child, depth + 1));
      }
    };
    
    nodeList.forEach(node => addNode(node));
    return flattened;
  };

  const flatNodes = flattenNodes(nodes);

  // Load existing asset data if editing
  const existingAsset = assets.find(asset => asset.id === assetId);

  useEffect(() => {
    if (existingAsset) {
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
        last_maintenance_date: existingAsset.last_maintenance_date || '',
        next_maintenance_date: existingAsset.next_maintenance_date || '',
        category: existingAsset.category || '',
        subcategory: existingAsset.subcategory || '',
        parent_asset_id: existingAsset.parent_asset_id || '',
        purchase_cost: existingAsset.purchase_cost?.toString() || '',
        warranty_expiry_date: existingAsset.warranty_expiry_date || '',
        asset_image_url: existingAsset.asset_image_url || '',
        qr_code_data: existingAsset.qr_code_data || ''
      });
    }
  }, [existingAsset]);

  // Generate QR code data when asset name or number changes
  useEffect(() => {
    if (formData.name && !assetId) {
      const qrData = JSON.stringify({
        name: formData.name,
        tag: formData.asset_number,
        id: 'will-be-generated'
      });
      setFormData(prev => ({ ...prev, qr_code_data: qrData }));
    }
  }, [formData.name, formData.asset_number, assetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const assetData = {
        ...formData,
        health_score: existingAsset?.health_score || 100, // Default to 100 for new assets
        hierarchy_node_id: formData.hierarchy_node_id || null,
        asset_number: formData.asset_number || null,
        type: formData.type || null,
        description: formData.description || null,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        purchase_date: formData.purchase_date || null,
        last_maintenance_date: formData.last_maintenance_date || null,
        next_maintenance_date: formData.next_maintenance_date || null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        parent_asset_id: formData.parent_asset_id || null,
        purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
        warranty_expiry_date: formData.warranty_expiry_date || null,
        asset_image_url: formData.asset_image_url || null,
        qr_code_data: formData.qr_code_data || null
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
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="media">Media & QR</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential asset details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_number">Asset Tag/Number</Label>
                  <Input
                    id="asset_number"
                    value={formData.asset_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_number: e.target.value }))}
                    placeholder="e.g., AST-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Detailed description of the asset..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machinery">Machinery</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="it">IT Equipment</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="e.g., Laptop, Printer, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hierarchy_node">Asset Hierarchy Location</Label>
                  <Select
                    value={formData.hierarchy_node_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, hierarchy_node_id: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {flatNodes.map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {'  '.repeat(node.depth)}• {node.name} ({node.level_info?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <ParentAssetSelect
                    value={formData.parent_asset_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parent_asset_id: value || '' }))}
                    excludeAssetId={assetId}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>Manufacturer information and asset specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Asset['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                      <SelectItem value="decommissioned">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criticality">Criticality</Label>
                  <Select
                    value={formData.criticality}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, criticality: value as Asset['criticality'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial & Warranty</CardTitle>
              <CardDescription>Purchase information and maintenance dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_cost">Purchase Cost</Label>
                  <Input
                    id="purchase_cost"
                    type="number"
                    step="0.01"
                    value={formData.purchase_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry_date">Warranty Expiry Date</Label>
                <Input
                  id="warranty_expiry_date"
                  type="date"
                  value={formData.warranty_expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry_date: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_maintenance_date">Last Maintenance</Label>
                  <Input
                    id="last_maintenance_date"
                    type="date"
                    value={formData.last_maintenance_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_maintenance_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_maintenance_date">Next Maintenance</Label>
                  <Input
                    id="next_maintenance_date"
                    type="date"
                    value={formData.next_maintenance_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_maintenance_date: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Image</CardTitle>
                <CardDescription>Upload a photo of the asset</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  bucket="asset-images"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                  currentFile={formData.asset_image_url}
                  label="Asset Photo"
                  onFileUploaded={(url, fileName) => {
                    setFormData(prev => ({ ...prev, asset_image_url: url }));
                  }}
                  onFileRemoved={() => {
                    setFormData(prev => ({ ...prev, asset_image_url: '' }));
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload manuals, warranties, or other documents</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  bucket="asset-documents"
                  accept=".pdf,.doc,.docx,.txt"
                  maxSize={10 * 1024 * 1024} // 10MB
                  currentFile=""
                  label="Asset Documents"
                  onFileUploaded={(url, fileName) => {
                    setUploadedDocuments(prev => [...prev, { name: fileName, url }]);
                  }}
                  onFileRemoved={() => {
                    // Handle document removal if needed
                  }}
                />
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Documents:</Label>
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {doc.name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
                <CardDescription>Auto-generated QR code for asset identification</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {formData.qr_code_data && (
                  <QRCodePreview data={formData.qr_code_data} size={200} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (assetId ? 'Update Asset' : 'Create Asset')}
        </Button>
      </div>
    </form>
  );

  if (mode === 'page') {
    return <FormContent />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assetId ? 'Edit Asset' : 'Create New Asset'}
          </DialogTitle>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export default AssetManagementForm;