import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssets, Asset } from '@/hooks/useAssets';
import { useHierarchyNodes } from '@/hooks/useHierarchyData';

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
    health_score: 100,
    criticality: 'medium' as Asset['criticality'],
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    last_maintenance_date: '',
    next_maintenance_date: ''
  });

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
        health_score: existingAsset.health_score,
        criticality: existingAsset.criticality,
        manufacturer: existingAsset.manufacturer || '',
        model: existingAsset.model || '',
        serial_number: existingAsset.serial_number || '',
        purchase_date: existingAsset.purchase_date || '',
        last_maintenance_date: existingAsset.last_maintenance_date || '',
        next_maintenance_date: existingAsset.next_maintenance_date || ''
      });
    }
  }, [existingAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const assetData = {
        ...formData,
        hierarchy_node_id: formData.hierarchy_node_id || null,
        asset_number: formData.asset_number || null,
        type: formData.type || null,
        description: formData.description || null,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        purchase_date: formData.purchase_date || null,
        last_maintenance_date: formData.last_maintenance_date || null,
        next_maintenance_date: formData.next_maintenance_date || null
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

  if (mode === 'page') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="asset_number">Asset Number</Label>
            <Input
              id="asset_number"
              value={formData.asset_number}
              onChange={(e) => setFormData(prev => ({ ...prev, asset_number: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hierarchy_node">Location</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="health_score">Health Score (0-100)</Label>
            <Input
              id="health_score"
              type="number"
              min="0"
              max="100"
              value={formData.health_score}
              onChange={(e) => setFormData(prev => ({ ...prev, health_score: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
            />
          </div>

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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (assetId ? 'Update Asset' : 'Create Asset')}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assetId ? 'Edit Asset' : 'Create New Asset'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="asset_number">Asset Number</Label>
              <Input
                id="asset_number"
                value={formData.asset_number}
                onChange={(e) => setFormData(prev => ({ ...prev, asset_number: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hierarchy_node">Location</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="health_score">Health Score (0-100)</Label>
              <Input
                id="health_score"
                type="number"
                min="0"
                max="100"
                value={formData.health_score}
                onChange={(e) => setFormData(prev => ({ ...prev, health_score: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
              />
            </div>

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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (assetId ? 'Update Asset' : 'Create Asset')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetManagementForm;