import { useState } from "react";
import { Plus, Eye, Trash2, Star, FileSpreadsheet, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssetBOMs, useBOMs, useBOMItems } from "@/hooks/useBOMs";
import { useNavigate } from "react-router-dom";

interface AssetBOMTabProps {
  assetId: string;
}

interface MaterialPreviewProps {
  bomId: string;
}

const MaterialPreview = ({ bomId }: MaterialPreviewProps) => {
  const { items, loading } = useBOMItems(bomId);
  
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No materials in this BOM
      </div>
    );
  }

  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Package className="w-4 h-4" />
        <span>Materials ({items.length})</span>
      </div>
      <div className="space-y-2">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-3 py-2">
            <div className="flex-1">
              <span className="font-medium text-foreground">{item.item_name}</span>
              {item.item_number && (
                <span className="text-muted-foreground ml-2">({item.item_number})</span>
              )}
            </div>
            <div className="text-muted-foreground">
              Qty: {item.quantity} {item.unit}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-sm text-muted-foreground pl-3">
            + {remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>
    </div>
  );
};

export const AssetBOMTab = ({ assetId }: AssetBOMTabProps) => {
  const { assetBOMs, loading: assetBOMsLoading, assignBOMToAsset, unassignBOMFromAsset } = useAssetBOMs(assetId);
  const { boms, loading: bomsLoading } = useBOMs();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedBOMId, setSelectedBOMId] = useState<string>("");
  const navigate = useNavigate();

  const availableBOMs = boms.filter(bom => 
    !assetBOMs.some(assetBOM => assetBOM.bom_id === bom.id)
  );

  const handleAssignBOM = async () => {
    if (!selectedBOMId) return;
    
    await assignBOMToAsset(selectedBOMId, false);
    setShowAssignDialog(false);
    setSelectedBOMId("");
  };

  const handleUnassignBOM = async (assetBOMId: string, bomName: string) => {
    if (window.confirm(`Are you sure you want to unassign "${bomName}" from this asset?`)) {
      await unassignBOMFromAsset(assetBOMId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      case 'archived': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturing': return 'bg-primary text-primary-foreground';
      case 'maintenance': return 'bg-info text-info-foreground';
      case 'spare_parts': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary';
    }
  };

  if (assetBOMsLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Bill of Materials
              </CardTitle>
              <CardDescription>
                Component lists and assembly structures for this asset
              </CardDescription>
            </div>
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign BOM
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign BOM to Asset</DialogTitle>
                  <DialogDescription>
                    Select a bill of materials to assign to this asset
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Select BOM</label>
                    <Select value={selectedBOMId} onValueChange={setSelectedBOMId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a BOM to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBOMs.map((bom) => (
                          <SelectItem key={bom.id} value={bom.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{bom.name} (v{bom.version})</span>
                              <Badge variant="outline" className={getTypeColor(bom.bom_type)}>
                                {bom.bom_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {availableBOMs.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        No BOMs available to assign. All existing BOMs are already assigned to this asset.
                      </p>
                      <Button variant="outline" onClick={() => navigate('/bom')}>
                        Create New BOM
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAssignDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAssignBOM}
                      disabled={!selectedBOMId}
                    >
                      Assign BOM
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {assetBOMs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">No BOMs Assigned</h3>
                <p className="text-sm text-muted-foreground">
                  This asset doesn't have any bill of materials assigned yet
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAssignDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Existing BOM
                </Button>
                <Button variant="outline" onClick={() => navigate('/bom')}>
                  Create New BOM
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assetBOMs.map((assetBOM) => (
            <Card key={assetBOM.id} className="hover:shadow-card transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {assetBOM.bom?.name}
                      </h3>
                      {assetBOM.is_primary && (
                        <Badge className="bg-warning text-warning-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      <Badge variant="outline" className={getStatusColor(assetBOM.bom?.status || '')}>
                        {assetBOM.bom?.status}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(assetBOM.bom?.bom_type || '')}>
                        {assetBOM.bom?.bom_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Version: {assetBOM.bom?.version}</span>
                      <span>•</span>
                      <span>Assigned: {new Date(assetBOM.assigned_date).toLocaleDateString()}</span>
                    </div>
                    
                    {assetBOM.bom?.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {assetBOM.bom.description}
                      </p>
                    )}
                    
                    {assetBOM.bom_id && <MaterialPreview bomId={assetBOM.bom_id} />}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/bom/${assetBOM.bom_id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnassignBOM(assetBOM.id, assetBOM.bom?.name || 'BOM')}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Unassign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};