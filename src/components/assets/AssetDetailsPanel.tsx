import { X, Edit, Calendar, FileText, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./StatusBadge";
import { HealthIndicator } from "./HealthIndicator";
import { CriticalityBadge } from "./CriticalityBadge";

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  type: string;
  location: string;
  status: "operational" | "maintenance" | "out_of_service" | "decommissioned";
  healthScore: number;
  criticality: "low" | "medium" | "high" | "critical";
  lastMaintenance: string;
  nextDue: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  specifications?: Record<string, string>;
}

interface AssetDetailsPanelProps {
  asset: Asset | null;
  onClose: () => void;
}

const mockMaintenanceHistory = [
  { date: "2024-01-15", type: "Preventive", description: "Regular inspection and lubrication", technician: "John Smith" },
  { date: "2023-12-10", type: "Corrective", description: "Belt replacement", technician: "Mike Johnson" },
  { date: "2023-11-05", type: "Preventive", description: "Quarterly maintenance", technician: "Sarah Wilson" },
];

const mockUpcomingSchedules = [
  { date: "2024-04-15", type: "Preventive", description: "Quarterly inspection", priority: "Medium" },
  { date: "2024-05-20", type: "Predictive", description: "Vibration analysis", priority: "Low" },
];

export function AssetDetailsPanel({ asset, onClose }: AssetDetailsPanelProps) {
  if (!asset) return null;

  return (
    <div className="w-96 h-full bg-card border-l border-border/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Asset Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Asset Image & Basic Info */}
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {asset.type ? asset.type.slice(0, 2).toUpperCase() : 'AS'}
              </span>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground text-lg">{asset.name}</h4>
              <p className="text-sm text-muted-foreground">{asset.assetNumber}</p>
            </div>
          </div>

          {/* Status & Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <StatusBadge status={asset.status} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Health Score</span>
              <HealthIndicator score={asset.healthScore} className="w-24" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Criticality</span>
              <CriticalityBadge criticality={asset.criticality} />
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Information</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium text-foreground">{asset.type || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Location</span>
                <p className="font-medium text-foreground text-xs" title={asset.location || ''}>
                  {asset.location ? asset.location.split(' > ').pop() : 'N/A'}
                </p>
              </div>
              {asset.manufacturer && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Manufacturer</span>
                  <p className="font-medium text-foreground">{asset.manufacturer}</p>
                </div>
              )}
              {asset.model && (
                <div>
                  <span className="text-muted-foreground">Model</span>
                  <p className="font-medium text-foreground">{asset.model}</p>
                </div>
              )}
              {asset.serialNumber && (
                <div>
                  <span className="text-muted-foreground">Serial</span>
                  <p className="font-medium text-foreground">{asset.serialNumber}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Maintenance */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Maintenance</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Last Service</span>
                <p className="font-medium text-foreground">
                  {new Date(asset.lastMaintenance).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Next Due</span>
                <p className={`font-medium ${
                  new Date(asset.nextDue) < new Date() ? 'text-red-500' : 'text-foreground'
                }`}>
                  {new Date(asset.nextDue).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Recent History</h5>
            <div className="space-y-2">
              {mockMaintenanceHistory.slice(0, 3).map((item, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {item.technician}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Schedules */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Upcoming</h5>
            <div className="space-y-2">
              {mockUpcomingSchedules.map((item, index) => (
                <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="text-xs text-blue-500 mt-1">{item.priority} Priority</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-6 border-t border-border/50 space-y-2">
        <Button className="w-full" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Asset
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>
    </div>
  );
}