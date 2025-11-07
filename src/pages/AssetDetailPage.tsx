import { AssetBOMTab } from '@/components/bom/AssetBOMTab';
import { AssetMeterGroupsTab } from '@/components/assets/AssetMeterGroupsTab';
import { AssetSkillRequirementsTab } from '@/components/assets/AssetSkillRequirementsTab';
import { AssetIoTDevicesTab } from '@/components/assets/AssetIoTDevicesTab';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAssets } from '@/hooks/useAssets';
import { useAssetMaintenance } from '@/hooks/useMaintenance';
import { useAssetLocation } from '@/hooks/useAssetLocation';
import { resolveIcon } from '@/lib/iconResolver';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { QRCodePreview } from '@/components/assets/QRCodePreview';
import { StatusBadge } from '@/components/assets/StatusBadge';
import { CriticalityBadge } from '@/components/assets/CriticalityBadge';
import { HealthIndicator } from '@/components/assets/HealthIndicator';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  FileText, 
  Settings, 
  DollarSign,
  MapPin,
  TrendingUp,
  Download,
  Share,
  Copy,
  QrCode,
  Wrench,
  AlertTriangle,
  Clock,
  Camera,
  Upload,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, loading, error } = useAssets();
  const asset = assets.find(a => a.id === id);
  const { maintenanceHistory, upcomingWorkOrders, recentWorkOrders, loading: maintenanceLoading } = useAssetMaintenance(id || '');
  const { location: assetLocation, loading: locationLoading } = useAssetLocation(id || '');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Asset Not Found</h1>
          <p className="text-muted-foreground">The asset you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/assets')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    return amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : 'N/A';
  };

  const formatDate = (date?: string) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{asset.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{asset.name}</h1>
          <p className="text-lg text-muted-foreground">Asset #{asset.asset_number || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => navigate(`/assets/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Asset
          </Button>
        </div>
      </div>

      {/* Asset Overview Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Asset Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border">
                {asset.asset_image_url ? (
                  <img 
                    src={asset.asset_image_url} 
                    alt={asset.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No image</p>
                  </div>
                )}
              </div>
              
              {/* QR Code */}
              {asset.qr_code_data && (
                <div className="text-center">
                  <QRCodePreview data={asset.qr_code_data} size={120} />
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    Print QR
                  </Button>
                </div>
              )}
            </div>

            {/* Asset Status & Health */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <StatusBadge status={asset.status} />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Criticality</label>
                <div className="mt-1">
                  <CriticalityBadge criticality={asset.criticality} />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Health Score</label>
                <div className="mt-1">
                  <HealthIndicator score={asset.health_score} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{asset.location || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-sm text-foreground mt-1">{asset.type || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                <p className="text-sm text-foreground mt-1">{asset.manufacturer || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <p className="text-sm text-foreground mt-1">{asset.model || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                <p className="text-sm text-foreground mt-1">{asset.serial_number || 'N/A'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="sm">
                <Wrench className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
              
              <Button variant="outline" className="w-full" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Add Document
              </Button>
              
              <Button variant="outline" className="w-full" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
              
              <Button variant="outline" className="w-full" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Clone Asset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="meters">Meter Groups</TabsTrigger>
          <TabsTrigger value="skills">Required Skills</TabsTrigger>
          <TabsTrigger value="iot">IoT Devices</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset Number</label>
                    <p className="text-sm text-foreground mt-1">{asset.asset_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm text-foreground mt-1">{asset.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                    <p className="text-sm text-foreground mt-1">{asset.subcategory || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parent Asset</label>
                    <p className="text-sm text-foreground mt-1">{asset.parent_asset_id ? 'Linked' : 'None'}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm text-foreground mt-1">{asset.description || 'No description available'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                    <p className="text-sm text-foreground mt-1">{formatDate(asset.purchase_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Maintenance</label>
                    <p className="text-sm text-foreground mt-1">{formatDate(asset.last_maintenance_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Next Maintenance</label>
                    <p className="text-sm text-foreground mt-1">{formatDate(asset.next_maintenance_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warranty Expiry</label>
                    <p className="text-sm text-foreground mt-1">{formatDate(asset.warranty_expiry_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
                <CardDescription>Recorded maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : maintenanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {maintenanceHistory.map((record) => (
                      <div key={record.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">{record.maintenance_type}</h4>
                          <Badge variant="outline">{record.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Date: {formatDate(record.performed_date)}</span>
                          <span>Cost: {formatCurrency(record.cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No maintenance history available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Work Orders</CardTitle>
                <CardDescription>Scheduled maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : upcomingWorkOrders.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingWorkOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">{order.title}</h4>
                          <Badge variant="outline">{order.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Scheduled: {formatDate(order.scheduled_date)}</span>
                          <span>Est. Cost: {formatCurrency(order.estimated_cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No upcoming work orders</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Work Orders</CardTitle>
                <CardDescription>Completed and cancelled work orders</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : recentWorkOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentWorkOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">{order.title}</h4>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Type: {order.maintenance_type}</span>
                            <span>Priority: {order.priority}</span>
                          </div>
                          {order.assigned_technician && (
                            <div className="text-xs text-muted-foreground">
                              Technician: {order.assigned_technician}
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duration: {order.estimated_duration_hours || 'N/A'} hrs</span>
                            <span>Cost: {formatCurrency(order.estimated_cost)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent work orders</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BOM Tab */}
        <TabsContent value="bom" className="mt-6">
          <AssetBOMTab assetId={id!} />
        </TabsContent>

        {/* Meter Groups Tab */}
        <TabsContent value="meters" className="mt-6">
          <AssetMeterGroupsTab assetId={id!} />
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6">
          <AssetSkillRequirementsTab assetId={id!} />
        </TabsContent>

        {/* IoT Devices Tab */}
        <TabsContent value="iot" className="space-y-4">
          <AssetIoTDevicesTab assetId={id!} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Asset Documents
              </CardTitle>
              <CardDescription>Manuals, warranties, certificates, and other documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No documents uploaded</h3>
                <p className="text-muted-foreground mb-4">Upload manuals, warranties, and other asset-related documents</p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-foreground">Purchase Cost</h4>
                  <p className="text-2xl font-bold text-primary mt-2">{formatCurrency(asset.purchase_cost)}</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-foreground">Maintenance Cost</h4>
                  <p className="text-2xl font-bold text-secondary-accent mt-2">
                    {formatCurrency(maintenanceHistory.reduce((sum, record) => sum + (record.cost || 0), 0))}
                  </p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-foreground">Total Cost</h4>
                  <p className="text-2xl font-bold text-warning mt-2">
                    {formatCurrency(
                      (asset.purchase_cost || 0) + 
                      maintenanceHistory.reduce((sum, record) => sum + (record.cost || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationLoading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </div>
              ) : !assetLocation?.currentLocation ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hierarchy assigned</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Location */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Location</label>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {assetLocation.currentLocation.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assetLocation.currentLocation.levelName}
                    </p>
                  </div>

                  {/* Full Hierarchy Path */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Hierarchy Path
                    </label>
                    <div className="flex items-center gap-2 flex-wrap bg-muted/50 p-3 rounded-lg">
                      {assetLocation.levels.map((level, index) => {
                        const IconComponent = resolveIcon(level.icon);
                        return (
                          <div key={level.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md border border-border">
                              <IconComponent 
                                className="h-4 w-4" 
                                style={{ color: level.color || 'currentColor' }}
                              />
                              <span className="text-sm font-medium">{level.name}</span>
                            </div>
                            {index < assetLocation.levels.length - 1 && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hierarchy Details */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Hierarchy Details
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {assetLocation.levels.map((level) => {
                        const IconComponent = resolveIcon(level.icon);
                        return (
                          <div 
                            key={level.id}
                            className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: level.color ? `${level.color}20` : 'var(--muted)' }}
                              >
                                <IconComponent 
                                  className="h-5 w-5" 
                                  style={{ color: level.color || 'currentColor' }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                  {level.levelName}
                                </p>
                                <p className="text-sm font-medium text-foreground truncate">
                                  {level.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline">
                      <MapPin className="w-4 h-4 mr-2" />
                      Change Location
                    </Button>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Hierarchy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-foreground">Uptime</h4>
                  <p className="text-2xl font-bold text-accent-success mt-2">98.5%</p>
                  <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-foreground">MTBF</h4>
                  <p className="text-2xl font-bold text-info mt-2">420 hrs</p>
                  <p className="text-sm text-muted-foreground mt-1">Mean Time Between Failures</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-foreground">Efficiency</h4>
                  <p className="text-2xl font-bold text-primary mt-2">94.2%</p>
                  <p className="text-sm text-muted-foreground mt-1">Overall Equipment Effectiveness</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetDetailPage;