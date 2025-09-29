import { X, Edit, Calendar, FileText, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./StatusBadge";
import { HealthIndicator } from "./HealthIndicator";
import { CriticalityBadge } from "./CriticalityBadge";
import { Asset } from "@/hooks/useAssets";
import { useAssetMaintenance } from "@/hooks/useMaintenance";

interface AssetDetailsPanelProps {
  asset: Asset | null;
  onClose: () => void;
}

export function AssetDetailsPanel({ asset, onClose }: AssetDetailsPanelProps) {
  const { maintenanceHistory, upcomingWorkOrders, loading: maintenanceLoading } = useAssetMaintenance(asset?.id || '');
  
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
            {asset.asset_image_url ? (
              <div className="aspect-video bg-gradient-primary rounded-lg overflow-hidden">
                <img 
                  src={asset.asset_image_url} 
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {asset.type ? asset.type.slice(0, 2).toUpperCase() : 'AS'}
                </span>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-foreground text-lg">{asset.name}</h4>
              <p className="text-sm text-muted-foreground">{asset.asset_number || 'No asset number'}</p>
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
              <HealthIndicator score={asset.health_score} className="w-24" />
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
              {asset.serial_number && (
                <div>
                  <span className="text-muted-foreground">Serial</span>
                  <p className="font-medium text-foreground">{asset.serial_number}</p>
                </div>
              )}
              {asset.category && (
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium text-foreground">{asset.category}</p>
                </div>
              )}
              {asset.purchase_cost && (
                <div>
                  <span className="text-muted-foreground">Purchase Cost</span>
                  <p className="font-medium text-foreground">${asset.purchase_cost.toLocaleString()}</p>
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
                  {asset.last_maintenance_date 
                    ? new Date(asset.last_maintenance_date).toLocaleDateString()
                    : 'No records'
                  }
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Next Due</span>
                <p className={`font-medium ${
                  asset.next_maintenance_date && new Date(asset.next_maintenance_date) < new Date() 
                    ? 'text-red-500' : 'text-foreground'
                }`}>
                  {asset.next_maintenance_date 
                    ? new Date(asset.next_maintenance_date).toLocaleDateString()
                    : 'Not scheduled'
                  }
                </p>
              </div>
              {asset.warranty_expiry_date && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Warranty Expires</span>
                  <p className="font-medium text-foreground">
                    {new Date(asset.warranty_expiry_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Recent History</h5>
            {maintenanceLoading ? (
              <div className="text-sm text-muted-foreground">Loading maintenance history...</div>
            ) : maintenanceHistory.length === 0 ? (
              <div className="text-sm text-muted-foreground">No maintenance history available</div>
            ) : (
              <div className="space-y-2">
                {maintenanceHistory.slice(0, 3).map((record) => (
                  <div key={record.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {record.maintenance_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.performed_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{record.description}</p>
                    {record.technician_name && (
                      <p className="text-xs text-muted-foreground mt-1">by {record.technician_name}</p>
                    )}
                    {record.cost && (
                      <p className="text-xs text-muted-foreground mt-1">Cost: ${record.cost}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedules */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Upcoming</h5>
            {maintenanceLoading ? (
              <div className="text-sm text-muted-foreground">Loading work orders...</div>
            ) : upcomingWorkOrders.length === 0 ? (
              <div className="text-sm text-muted-foreground">No upcoming maintenance scheduled</div>
            ) : (
              <div className="space-y-2">
                {upcomingWorkOrders.slice(0, 3).map((workOrder) => (
                  <div key={workOrder.id} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20 capitalize">
                        {workOrder.maintenance_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(workOrder.scheduled_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{workOrder.title}</p>
                    {workOrder.description && (
                      <p className="text-xs text-muted-foreground mt-1">{workOrder.description}</p>
                    )}
                    <p className="text-xs text-blue-500 mt-1 capitalize">{workOrder.priority} Priority</p>
                    {workOrder.assigned_technician && (
                      <p className="text-xs text-muted-foreground">Assigned to: {workOrder.assigned_technician}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
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