import React, { useState } from "react";
import { MoreHorizontal, Eye, Edit, Archive, Copy, FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { HealthIndicator } from "./HealthIndicator";
import { CriticalityBadge } from "./CriticalityBadge";
import { useAssets, Asset } from "@/hooks/useAssets";
import AssetManagementForm from "./AssetManagementForm";

interface AssetTableProps {
  onAssetSelect?: (asset: Asset) => void;
  filters?: {
    search: string;
    status: string[];
    criticality: string[];
    type: string[];
    location: string;
  } | null;
}

export const AssetTable: React.FC<AssetTableProps> = ({ onAssetSelect, filters }) => {
  const { assets, loading, error, deleteAsset } = useAssets();
  const navigate = useNavigate();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | undefined>();

  // Apply filters to assets
  const filteredAssets = React.useMemo(() => {
    if (!filters) return assets;

    return assets.filter(asset => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          asset.name.toLowerCase().includes(searchLower) ||
          asset.asset_number?.toLowerCase().includes(searchLower) ||
          asset.location?.toLowerCase().includes(searchLower) ||
          asset.type?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        if (!filters.status.includes(asset.status)) return false;
      }

      // Criticality filter
      if (filters.criticality.length > 0) {
        if (!filters.criticality.includes(asset.criticality)) return false;
      }

      // Type filter
      if (filters.type.length > 0) {
        if (!asset.type || !filters.type.includes(asset.type)) return false;
      }

      // Location filter
      if (filters.location) {
        if (!asset.location || !asset.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }

      return true;
    });
  }, [assets, filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssets(prev => [...prev, assetId]);
    } else {
      setSelectedAssets(prev => prev.filter(id => id !== assetId));
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(assetId);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return `${Math.abs(diffInDays)} days ago`;
    } else if (diffInDays === 0) {
      return "Today";
    } else {
      return `In ${diffInDays} days`;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading assets...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading assets: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {selectedAssets.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
          <span className="text-sm text-muted-foreground">
            {selectedAssets.length} assets selected
          </span>
          <Button variant="outline" size="sm">
            Schedule Maintenance
          </Button>
          <Button variant="outline" size="sm">
            Update Status
          </Button>
          <Button variant="outline" size="sm">
            Export Selected
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead className="text-center">Criticality</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {assets.length === 0 ? "No assets found. Click 'Add Asset' to create your first asset." : "No assets match the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow 
                  key={asset.id}
                  className="border-border/50 hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-foreground">
                          {(asset.type || 'AS').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{asset.name}</div>
                        {asset.asset_number && (
                          <div className="text-sm text-muted-foreground">{asset.asset_number}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{asset.type || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-48 truncate" title={asset.location}>
                      {asset.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell>
                    <HealthIndicator score={asset.health_score} className="w-24" />
                  </TableCell>
                  <TableCell className="text-center">
                    <CriticalityBadge criticality={asset.criticality} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{formatDate(asset.last_maintenance_date)}</div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm font-medium ${
                      asset.next_maintenance_date && new Date(asset.next_maintenance_date) < new Date() ? 'text-red-500' :
                      asset.next_maintenance_date && new Date(asset.next_maintenance_date).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000 ? 'text-orange-500' :
                      'text-foreground'
                    }`}>
                      {getRelativeTime(asset.next_maintenance_date)}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border-border">
                        <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditingAsset(asset.id);
                          setShowAssetForm(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showAssetForm && (
        <AssetManagementForm
          assetId={editingAsset}
          onClose={() => {
            setShowAssetForm(false);
            setEditingAsset(undefined);
          }}
        />
      )}
    </div>
  );
};