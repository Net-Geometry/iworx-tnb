import React, { useState } from "react";
import { MoreHorizontal, Eye, Edit, Archive, Copy, FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  viewMode?: "list" | "grid";
}

export const AssetTable: React.FC<AssetTableProps> = ({ onAssetSelect, filters, viewMode = "list" }) => {
  const { assets, loading, error, deleteAsset } = useAssets();
  const navigate = useNavigate();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(paginatedAssets.map(asset => asset.id));
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

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {paginatedAssets.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          {assets.length === 0 ? "No assets found. Click 'Add Asset' to create your first asset." : "No assets match the current filters."}
        </div>
      ) : (
        paginatedAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-card border border-border/50 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate(`/assets/${asset.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {(asset.type || 'AS').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{asset.name}</h3>
                  {asset.asset_number && (
                    <p className="text-xs text-muted-foreground">{asset.asset_number}</p>
                  )}
                </div>
              </div>
              <Checkbox
                checked={selectedAssets.includes(asset.id)}
                onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <StatusBadge status={asset.status} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Health</span>
                <HealthIndicator score={asset.health_score} className="w-16" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Criticality</span>
                <CriticalityBadge criticality={asset.criticality} />
              </div>
              
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground truncate" title={asset.location}>
                  📍 {asset.location}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

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

      {viewMode === "grid" ? (
        <GridView />
      ) : (
        <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.length === paginatedAssets.length && paginatedAssets.length > 0}
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
            {paginatedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {assets.length === 0 ? "No assets found. Click 'Add Asset' to create your first asset." : "No assets match the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssets.map((asset) => (
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
      )}

      {/* Pagination Controls */}
      {filteredAssets.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAssets.length)} of {filteredAssets.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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