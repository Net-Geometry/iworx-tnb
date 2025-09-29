import { useState } from "react";
import { ChevronDown, MoreHorizontal, Eye, Edit, Calendar, QrCode } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, AssetStatus } from "./StatusBadge";
import { HealthIndicator } from "./HealthIndicator";
import { CriticalityBadge, AssetCriticality } from "./CriticalityBadge";

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  type: string;
  location: string;
  status: AssetStatus;
  healthScore: number;
  criticality: AssetCriticality;
  lastMaintenance: string;
  nextDue: string;
  imageUrl?: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "Conveyor Belt System A1",
    assetNumber: "CVB-001",
    type: "Conveyor",
    location: "Plant 1 > Production > Line A",
    status: "operational",
    healthScore: 94,
    criticality: "high",
    lastMaintenance: "2024-01-15",
    nextDue: "2024-04-15",
  },
  {
    id: "2", 
    name: "Hydraulic Press HP-200",
    assetNumber: "HP-200",
    type: "Press",
    location: "Plant 1 > Production > Line B",
    status: "warning",
    healthScore: 72,
    criticality: "high",
    lastMaintenance: "2024-01-10",
    nextDue: "2024-04-10",
  },
  {
    id: "3",
    name: "Air Compressor AC-50",
    assetNumber: "AC-050",
    type: "Compressor", 
    location: "Plant 1 > Utilities",
    status: "critical",
    healthScore: 45,
    criticality: "medium",
    lastMaintenance: "2023-12-20",
    nextDue: "2024-03-20",
  },
  {
    id: "4",
    name: "Packaging Robot PR-300",
    assetNumber: "PR-300",
    type: "Robot",
    location: "Plant 1 > Packaging",
    status: "operational",
    healthScore: 88,
    criticality: "medium",
    lastMaintenance: "2024-01-20",
    nextDue: "2024-04-20",
  },
  {
    id: "5",
    name: "Cooling Tower CT-100",
    assetNumber: "CT-100", 
    type: "Cooling",
    location: "Plant 1 > HVAC",
    status: "offline",
    healthScore: 0,
    criticality: "low",
    lastMaintenance: "2023-11-15",
    nextDue: "2024-02-15",
  }
];

interface AssetTableProps {
  onAssetSelect?: (asset: Asset) => void;
}

export function AssetTable({ onAssetSelect }: AssetTableProps) {
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(new Set(mockAssets.map(asset => asset.id)));
    } else {
      setSelectedAssets(new Set());
    }
  };

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssets);
    if (checked) {
      newSelected.add(assetId);
    } else {
      newSelected.delete(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays <= 7) return `${diffDays} days`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-4">
      {selectedAssets.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
          <span className="text-sm text-muted-foreground">
            {selectedAssets.size} assets selected
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
                  checked={selectedAssets.size === mockAssets.length}
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
            {mockAssets.map((asset) => (
              <TableRow 
                key={asset.id}
                className="border-border/50 hover:bg-muted/30 cursor-pointer"
                onClick={() => onAssetSelect?.(asset)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedAssets.has(asset.id)}
                    onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-foreground">
                        {asset.type.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">{asset.assetNumber}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">{asset.type}</span>
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
                  <HealthIndicator score={asset.healthScore} className="w-24" />
                </TableCell>
                <TableCell className="text-center">
                  <CriticalityBadge criticality={asset.criticality} />
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{formatDate(asset.lastMaintenance)}</div>
                </TableCell>
                <TableCell>
                  <div className={`text-sm font-medium ${
                    new Date(asset.nextDue) < new Date() ? 'text-red-500' :
                    new Date(asset.nextDue).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000 ? 'text-orange-500' :
                    'text-foreground'
                  }`}>
                    {getRelativeTime(asset.nextDue)}
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}