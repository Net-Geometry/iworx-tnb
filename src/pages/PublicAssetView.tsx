import { useParams, Link } from 'react-router-dom';
import { usePublicAsset } from '@/hooks/usePublicAsset';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Tag, 
  Package, 
  MapPin, 
  LogIn,
  AlertCircle,
  Hash,
  Factory
} from 'lucide-react';

/**
 * PublicAssetView - Public-facing page for viewing basic asset information via QR code
 * No authentication required, displays only non-sensitive data
 * Includes login prompt for accessing full asset details
 */
export default function PublicAssetView() {
  const { id } = useParams<{ id: string }>();
  const { data: asset, isLoading, error } = usePublicAsset(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Asset Not Found</h2>
            <p className="text-muted-foreground">
              This asset is not available for public viewing or does not exist.
            </p>
            <Button asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login for Full Access
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    operational: 'bg-success/10 text-success border-success/20',
    maintenance: 'bg-warning/10 text-warning border-warning/20',
    'out-of-service': 'bg-destructive/10 text-destructive border-destructive/20',
    retired: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Public View Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2">
        <div className="container max-w-4xl mx-auto px-4">
          <p className="text-sm text-center text-foreground">
            <span className="font-medium">Public View</span> - Limited asset information
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Asset Header Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{asset.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-mono">{asset.asset_number}</span>
                </div>
              </div>
              {asset.status && (
                <Badge 
                  variant="outline" 
                  className={statusColors[asset.status] || 'bg-muted'}
                >
                  {asset.status.replace('-', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>

          {/* Asset Image */}
          {asset.asset_image_url && (
            <CardContent className="pt-0">
              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asset.type && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground">{asset.type}</p>
                  </div>
                </div>
              )}

              {asset.category && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Tag className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium text-foreground">{asset.category}</p>
                  </div>
                </div>
              )}

              {asset.location && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{asset.location}</p>
                  </div>
                </div>
              )}

              {asset.manufacturer && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Manufacturer</p>
                    <p className="font-medium text-foreground">{asset.manufacturer}</p>
                  </div>
                </div>
              )}

              {asset.model && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
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

        {/* Login Prompt Card */}
        <Card className="shadow-lg border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Need More Details?
              </h3>
              <p className="text-sm text-muted-foreground">
                Login to view complete asset information including maintenance history, 
                documents, financial data, and more.
              </p>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link to={`/assets/${asset.id}`}>
                <LogIn className="mr-2 h-4 w-4" />
                Login for Full Asset Details
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Asset information accessed via QR code • Access logged for security
          </p>
        </div>
      </div>
    </div>
  );
}
