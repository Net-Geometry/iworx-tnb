import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset } from '@/hooks/useAssets';
import { FileUpload } from './FileUpload';
import { QRCodePreview } from './QRCodePreview';
import { ParentAssetSelect } from './ParentAssetSelect';
import { Model3DUpload } from './Model3DUpload';

interface AssetFormContentProps {
  formData: {
    name: string;
    asset_number: string;
    type: string;
    description: string;
    hierarchy_node_id: string;
    status: Asset['status'];
    criticality: Asset['criticality'];
    manufacturer: string;
    model: string;
    serial_number: string;
    purchase_date: string;
    category: string;
    subcategory: string;
    parent_asset_id: string;
    purchase_cost: string;
    warranty_expiry_date: string;
    asset_image_url: string;
    qr_code_data: string;
    model_3d_url: string;
    model_3d_scale_x: string;
    model_3d_scale_y: string;
    model_3d_scale_z: string;
    model_3d_rotation_x: string;
    model_3d_rotation_y: string;
    model_3d_rotation_z: string;
  };
  flatNodes: any[];
  assetId?: string;
  loading: boolean;
  uploadedDocuments: Array<{name: string, url: string}>;
  onFormDataChange: (field: string, value: any) => void;
  onUploadedDocumentsChange: (docs: Array<{name: string, url: string}>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AssetFormContent: React.FC<AssetFormContentProps> = ({
  formData,
  flatNodes,
  assetId,
  loading,
  uploadedDocuments,
  onFormDataChange,
  onUploadedDocumentsChange,
  onSubmit,
  onClose
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="media">Media & QR</TabsTrigger>
          <TabsTrigger value="3d-model">3D Model</TabsTrigger>
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
                    onChange={(e) => onFormDataChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_number">Asset Tag/Number</Label>
                  <Input
                    id="asset_number"
                    value={formData.asset_number}
                    onChange={(e) => onFormDataChange('asset_number', e.target.value)}
                    placeholder="e.g., AST-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => onFormDataChange('description', e.target.value)}
                  rows={3}
                  placeholder="Detailed description of the asset..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => onFormDataChange('category', value)}
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
                    onChange={(e) => onFormDataChange('subcategory', e.target.value)}
                    placeholder="e.g., Laptop, Printer, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hierarchy_node">Asset Hierarchy Location</Label>
                  <Select
                    value={formData.hierarchy_node_id}
                    onValueChange={(value) => onFormDataChange('hierarchy_node_id', value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {flatNodes.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No hierarchy nodes available
                        </SelectItem>
                      ) : (
                        flatNodes.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {'  '.repeat(node.depth || 0)}• {node.name} ({node.level_info?.name || 'Node'})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <ParentAssetSelect
                    value={formData.parent_asset_id}
                    onValueChange={(value) => onFormDataChange('parent_asset_id', value || '')}
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
                    onChange={(e) => onFormDataChange('manufacturer', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => onFormDataChange('model', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => onFormDataChange('serial_number', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => onFormDataChange('status', value as Asset['status'])}
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
                    onValueChange={(value) => onFormDataChange('criticality', value as Asset['criticality'])}
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
              <CardDescription>Purchase information and warranty details</CardDescription>
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
                    onChange={(e) => onFormDataChange('purchase_cost', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => onFormDataChange('purchase_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry_date">Warranty Expiry Date</Label>
                <Input
                  id="warranty_expiry_date"
                  type="date"
                  value={formData.warranty_expiry_date}
                  onChange={(e) => onFormDataChange('warranty_expiry_date', e.target.value)}
                />
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
                    onFormDataChange('asset_image_url', url);
                  }}
                  onFileRemoved={() => {
                    onFormDataChange('asset_image_url', '');
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
                    onUploadedDocumentsChange([...uploadedDocuments, { name: fileName, url }]);
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

        <TabsContent value="3d-model" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>3D Model Upload</CardTitle>
              <CardDescription>Upload a GLB or GLTF 3D model for visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Model3DUpload
                assetId={assetId}
                currentFileUrl={formData.model_3d_url}
                onFileUploaded={(url) => onFormDataChange('model_3d_url', url)}
                onFileRemoved={() => onFormDataChange('model_3d_url', '')}
              />

              <div className="space-y-4">
                <div>
                  <Label>Model Scale</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="scale_x" className="text-xs text-muted-foreground">X</Label>
                      <Input
                        id="scale_x"
                        type="number"
                        step="0.1"
                        value={formData.model_3d_scale_x}
                        onChange={(e) => onFormDataChange('model_3d_scale_x', e.target.value)}
                        placeholder="1.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scale_y" className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        id="scale_y"
                        type="number"
                        step="0.1"
                        value={formData.model_3d_scale_y}
                        onChange={(e) => onFormDataChange('model_3d_scale_y', e.target.value)}
                        placeholder="1.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scale_z" className="text-xs text-muted-foreground">Z</Label>
                      <Input
                        id="scale_z"
                        type="number"
                        step="0.1"
                        value={formData.model_3d_scale_z}
                        onChange={(e) => onFormDataChange('model_3d_scale_z', e.target.value)}
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Model Rotation (radians)</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="rotation_x" className="text-xs text-muted-foreground">X</Label>
                      <Input
                        id="rotation_x"
                        type="number"
                        step="0.1"
                        value={formData.model_3d_rotation_x}
                        onChange={(e) => onFormDataChange('model_3d_rotation_x', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rotation_y" className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        id="rotation_y"
                        type="number"
                        step="0.1"
                        value={formData.model_3d_rotation_y}
                        onChange={(e) => onFormDataChange('model_3d_rotation_y', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rotation_z" className="text-xs text-muted-foreground">Z</Label>
                      <Input
                        id="rotation_z"
                        type="number"
                        step="0.1"
                        value={formData.model_3d_rotation_z}
                        onChange={(e) => onFormDataChange('model_3d_rotation_z', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
};

export default React.memo(AssetFormContent);