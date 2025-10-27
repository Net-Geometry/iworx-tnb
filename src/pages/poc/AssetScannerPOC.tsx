import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Smartphone, ArrowRight, Zap, Activity } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect } from 'react';

/**
 * POC Asset Scanner Landing Page
 * Demonstrates QR code scanning workflow for client demonstration
 * Shows sample QR code and provides demo mode
 */
export default function AssetScannerPOC() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Demo asset ID (the compressor with IoT device)
  const demoAssetId = 'ca3ab9bd-2bd1-42e4-935a-35996ff1149c';
  const pocUrl = `${window.location.origin}/poc/asset/${demoAssetId}`;

  useEffect(() => {
    // Generate QR code for the POC asset URL
    QRCode.toDataURL(pocUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    }).then(setQrCodeUrl);
  }, [pocUrl]);

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Header Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-4">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">iWorx Asset Intelligence</h1>
              <p className="text-sm text-muted-foreground">Proof of Concept Demonstration</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Live Demo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code */}
          <Card className="shadow-enterprise bg-gradient-card border-primary/20">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Scan Asset QR Code</CardTitle>
              <CardDescription className="text-base">
                Use your smartphone camera to scan this QR code and view live asset data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="bg-white p-8 rounded-lg flex items-center justify-center">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Asset QR Code" 
                    className="w-full max-w-sm"
                  />
                ) : (
                  <div className="w-64 h-64 bg-muted animate-pulse rounded-lg" />
                )}
              </div>

              {/* Asset Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">Demo Asset</p>
                <p className="text-xs text-muted-foreground font-mono">
                  C-377A-COMPRESSOR INSTRUMENT AIR
                </p>
                <p className="text-xs text-muted-foreground">
                  Asset ID: {demoAssetId}
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">How to Scan</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Open your smartphone camera app</li>
                      <li>Point at the QR code above</li>
                      <li>Tap the notification to open the link</li>
                      <li>View real-time asset & IoT data</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Try Demo Button */}
              <Button asChild size="lg" className="w-full">
                <Link to={`/poc/asset/${demoAssetId}`}>
                  Try Demo View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Features */}
          <div className="space-y-6">
            <Card className="shadow-card bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Key Demonstration Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'Instant Asset Access',
                    description: 'Scan QR code to instantly view comprehensive asset information without login',
                  },
                  {
                    title: 'Real-Time IoT Data',
                    description: 'Live sensor readings update automatically via WebSocket connection',
                  },
                  {
                    title: 'Device Status Monitoring',
                    description: 'View connection status, signal quality, and device health metrics',
                  },
                  {
                    title: 'Sensor Readings Display',
                    description: 'Temperature, vibration, tilt, battery voltage, and alarm status',
                  },
                  {
                    title: 'Visual Indicators',
                    description: 'Color-coded status badges and metric cards for quick assessment',
                  },
                  {
                    title: 'Mobile Optimized',
                    description: 'Responsive design works perfectly on smartphones and tablets',
                  },
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Technical Highlights */}
            <Card className="shadow-card bg-gradient-card border-border">
              <CardHeader>
                <CardTitle>Technical Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'No Authentication', value: 'Public Access' },
                    { label: 'Connection', value: 'WebSocket' },
                    { label: 'Update Rate', value: 'Real-Time' },
                    { label: 'Response Time', value: '< 2 seconds' },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Proof of Concept - Asset Intelligence with Real-Time IoT Integration
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This demonstration showcases QR code scanning, asset identification, and live sensor data visualization
          </p>
        </div>
      </div>
    </div>
  );
}
