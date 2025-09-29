import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHierarchyLevels, useHierarchyNodes, HierarchyNode, HierarchyAsset } from "@/hooks/useHierarchyData";
import { useToast } from "@/hooks/use-toast";

interface NodeManagementFormProps {
  nodeId?: string;
  onClose: () => void;
}

const statusOptions = [
  { value: 'operational', label: 'Operational' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
  { value: 'offline', label: 'Offline' },
];

export function NodeManagementForm({ nodeId, onClose }: NodeManagementFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    hierarchy_level_id: '',
    parent_id: '',
    status: 'operational',
    asset_count: 0,
    properties: '{}'
  });
  
  const [loading, setLoading] = useState(false);
  const { levels } = useHierarchyLevels();
  const { nodes, addNode, updateNode } = useHierarchyNodes();
  const { toast } = useToast();

  const isEditing = !!nodeId;
  
  // Flatten nodes for parent selection - only include hierarchy nodes, not assets
  const flattenNodes = (nodeList: HierarchyNode[]): HierarchyNode[] => {
    const result: HierarchyNode[] = [];
    
    const traverse = (nodes: HierarchyNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          // Filter to only traverse hierarchy nodes, not assets
          const childNodes = node.children.filter(child => child.nodeType === 'node') as HierarchyNode[];
          traverse(childNodes);
        }
      });
    };
    
    traverse(nodeList);
    return result;
  };

  const flatNodes = flattenNodes(nodes);
  const existingNode = flatNodes.find(n => n.id === nodeId);

  useEffect(() => {
    if (existingNode) {
      setFormData({
        name: existingNode.name,
        hierarchy_level_id: existingNode.hierarchy_level_id,
        parent_id: existingNode.parent_id || "none",
        status: existingNode.status,
        asset_count: existingNode.asset_count,
        properties: JSON.stringify(existingNode.properties, null, 2)
      });
    }
  }, [existingNode]);

  const selectedLevel = levels.find(l => l.id === formData.hierarchy_level_id);
  
  // Filter potential parents based on hierarchy level rules
  const getPotentialParents = () => {
    if (!selectedLevel) return [];
    
    const parentLevel = levels.find(l => l.level_order === selectedLevel.level_order - 1);
    if (!parentLevel) return [];
    
    return flatNodes.filter(node => 
      node.hierarchy_level_id === parentLevel.id && 
      node.id !== nodeId // Don't show self as parent
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse properties JSON
      let properties;
      try {
        properties = JSON.parse(formData.properties);
      } catch (err) {
        throw new Error('Invalid JSON in properties field');
      }

      const nodeData = {
        name: formData.name,
        hierarchy_level_id: formData.hierarchy_level_id,
        parent_id: formData.parent_id === "none" ? null : formData.parent_id,
        status: formData.status,
        asset_count: formData.asset_count,
        nodeType: 'node' as const,
        properties
      };

      console.log('Submitting node data:', nodeData);

      if (isEditing) {
        await updateNode(nodeId, nodeData);
        toast({
          title: "Success",
          description: "Hierarchy node updated successfully",
        });
      } else {
        await addNode(nodeData);
        toast({
          title: "Success",
          description: "Hierarchy node created successfully",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save node",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Hierarchy Node' : 'Add Hierarchy Node'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Node Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., California, Central Station"
              required
            />
          </div>

          <div>
            <Label htmlFor="hierarchy_level_id">Hierarchy Level</Label>
            <Select
              value={formData.hierarchy_level_id}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                hierarchy_level_id: value,
                parent_id: 'none' // Reset parent when level changes
              }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hierarchy level" />
              </SelectTrigger>
              <SelectContent>
                {levels
                  .sort((a, b) => a.level_order - b.level_order)
                  .map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} (Order: {level.level_order})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="parent_id">Parent Node</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent node" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent (Root Level)</SelectItem>
                {getPotentialParents().map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name} ({node.level_info?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="asset_count">Asset Count</Label>
            <Input
              id="asset_count"
              type="number"
              min="0"
              value={formData.asset_count}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                asset_count: parseInt(e.target.value) || 0 
              }))}
            />
          </div>

          <div>
            <Label htmlFor="properties">Properties (JSON)</Label>
            <Textarea
              id="properties"
              value={formData.properties}
              onChange={(e) => setFormData(prev => ({ ...prev, properties: e.target.value }))}
              placeholder='{"voltage_level": "110kV", "capacity": "500MW"}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}