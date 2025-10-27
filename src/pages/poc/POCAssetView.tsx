import { useParams, Link } from 'react-router-dom';
import { usePublicAsset } from '@/hooks/usePublicAsset';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Tag, 
  Package, 
  MapPin, 
  Hash,
  Factory,
  Activity,
  Wifi,
  AlertCircle,
  ArrowLeft,
  Radio
} from 'lucide-react';
import { POCIoTDataDisplay } from '@/components/poc/POCIoTDataDisplay';

/**
 * POC Asset View - Public asset view with real-time IoT data
 * Demonstrates complete workflow: Asset details + Live sensor readings
 * No authentication required for proof of concept
 */
export default function POCAssetView() {
  const { id } = useParams<{ id: string }>();
  const { data: asset, isLoading, error } = usePublicAsset(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-enterprise">
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-enterprise">
          <CardContent className="pt-6 space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Asset Not Found</h2>
            <p className="text-muted-foreground">
              This asset is not available or does not exist.
            </p>
            <Button asChild>
              <Link to="/poc/scanner">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Scanner
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    operational: 'bg-accent-success/20 text-accent-success border-accent-success/30',
    maintenance: 'bg-warning/20 text-warning border-warning/30',
    'out-of-service': 'bg-destructive/20 text-destructive border-destructive/30',
    retired: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* POC Header Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-3">
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Live Asset View - POC Demo
              </p>
              <p className="text-xs text-muted-foreground">
                Real-time data updates enabled
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/poc/scanner">
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back to Scanner
            </Link>
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Asset Header Card */}
        <Card className="shadow-enterprise bg-gradient-card border-primary/20">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-3xl font-bold">{asset.name}</CardTitle>
                  {asset.status && (
                    <Badge 
                      variant="outline" 
                      className={statusColors[asset.status] || 'bg-muted'}
                    >
                      {asset.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-mono">{asset.asset_number}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Asset Image */}
          {asset.asset_image_url && (
            <CardContent className="pt-0">
              <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden border border-border">
                <img
                  src={asset.asset_image_url}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          )}

          {/* Asset Details Grid */}
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asset.type && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground">{asset.type}</p>
                  </div>
                </div>
              )}

              {asset.category && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <Tag className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium text-foreground">{asset.category}</p>
                  </div>
                </div>
              )}

              {asset.location && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{asset.location}</p>
                  </div>
                </div>
              )}

              {asset.manufacturer && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Manufacturer</p>
                    <p className="font-medium text-foreground">{asset.manufacturer}</p>
                  </div>
                </div>
              )}

              {asset.model && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border md:col-span-2">
                  <Factory className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium text-foreground">
                      {asset.model}
                      {asset.serial_number && (
                        <span className="text-muted-foreground ml-2">
                          S/N: {asset.serial_number}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live IoT Data Section - THE KEY POC FEATURE */}
        <Card className="shadow-enterprise bg-gradient-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Radio className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Live IoT Device Data</CardTitle>
                  <CardDescription className="text-base">
                    Real-time sensor readings and device status
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-accent-success animate-pulse" />
                <span className="text-xs text-accent-success font-medium">Connected</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <POCIoTDataDisplay assetId={id!} />
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="border-primary/30 bg-primary/5">
          <Activity className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-foreground">
            This is a proof of concept demonstration showing real-time asset and IoT data integration. 
            Data updates automatically via WebSocket connection. No authentication required for POC access.
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Asset viewed via POC QR Code • Real-time data powered by iWorx IoT Platform
          </p>
        </div>
      </div>
    </div>
  );
}
