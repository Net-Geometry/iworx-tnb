/**
 * Digital Twin Demo Page
 * Showcases 3D visualization, IoT overlay, time travel, and simulations
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket, AlertCircle, Trash2 } from 'lucide-react';
import { Demo3DVisualization } from './digital-twin/components/Demo3DVisualization';
import { DemoIoTOverlay } from './digital-twin/components/DemoIoTOverlay';
import { DemoTimeTravel } from './digital-twin/components/DemoTimeTravel';
import { DemoSimulation } from './digital-twin/components/DemoSimulation';

export default function DigitalTwinDemo() {
  const [activeTab, setActiveTab] = useState('3d-viz');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🌐 Digital Twin Demo</h1>
          <p className="text-muted-foreground">
            Experience next-generation asset management with interactive 3D visualization, real-time
            IoT data, historical playback, and predictive simulations.
          </p>
        </div>
        <Badge variant="secondary" className="h-fit">
          <Rocket className="w-3 h-3 mr-1" />
          Demo Mode
        </Badge>
      </div>

      {/* Demo Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>📊 Demo Environment - Safe to Explore</AlertTitle>
        <AlertDescription>
          This demonstration uses mock data and can be easily removed. All functionality shown here
          can be integrated with your real assets, sensors, and operational data.
        </AlertDescription>
      </Alert>

      {/* Main Demo Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="3d-viz">3D Visualization</TabsTrigger>
          <TabsTrigger value="iot-live">IoT Live Data</TabsTrigger>
          <TabsTrigger value="time-travel">Time Travel</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
        </TabsList>

        <TabsContent value="3d-viz">
          <Demo3DVisualization />
        </TabsContent>

        <TabsContent value="iot-live">
          <DemoIoTOverlay />
        </TabsContent>

        <TabsContent value="time-travel">
          <DemoTimeTravel />
        </TabsContent>

        <TabsContent value="simulations">
          <DemoSimulation />
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <h3 className="text-xl font-semibold mb-4">🚀 Digital Twin Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">✅ 3D Interactive Models</h4>
            <p className="text-sm text-muted-foreground">
              Zoom from entire plant → building → floor → specific equipment. Navigate your asset
              hierarchy in 3D space.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✅ Real-Time IoT Data Overlay</h4>
            <p className="text-sm text-muted-foreground">
              See live temperature, vibration, voltage readings on 3D models. Color-coded by
              threshold status.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✅ Time-Travel Playback</h4>
            <p className="text-sm text-muted-foreground">
              Rewind to see what conditions were like when an incident occurred. Investigate trends
              leading to failures.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✅ What-If Scenario Testing</h4>
            <p className="text-sm text-muted-foreground">
              Simulate maintenance schedules or equipment changes. See predicted impact on
              operations, costs, and reliability.
            </p>
          </div>
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">🔧 Technical Implementation</h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Frontend:</strong> React Three Fiber (@react-three/fiber) for 3D rendering,
            @react-three/drei for helpers
          </div>
          <div>
            <strong>Real-Time Data:</strong> Supabase Realtime channels for live sensor updates
          </div>
          <div>
            <strong>Time-Series:</strong> Query historical data from asset_sensor_readings table
          </div>
          <div>
            <strong>Simulations:</strong> ML-based predictive models running in edge functions
          </div>
          <div>
            <strong>Integration:</strong> Works with your existing PostGIS spatial data and asset
            hierarchy
          </div>
        </div>
      </Card>

      {/* Removal Instructions */}
      <Card className="p-6 border-destructive/50">
        <div className="flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-destructive mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">How to Remove This Demo</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Delete the route from <code className="text-xs bg-muted px-1 py-0.5 rounded">src/App.tsx</code>{' '}
                (search for "/demo/digital-twin")
              </li>
              <li>
                Delete the folder{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  src/pages/demo/digital-twin/
                </code>
              </li>
              <li>
                Delete this file{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  src/pages/demo/DigitalTwinDemo.tsx
                </code>
              </li>
              <li>
                Remove sidebar link from{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  src/components/AppSidebar.tsx
                </code>
              </li>
              <li>
                Optional: Uninstall dependencies if not needed elsewhere:{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  @react-three/fiber, @react-three/drei, three
                </code>
              </li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Alert>
        <Rocket className="h-4 w-4" />
        <AlertTitle>Ready to Go Live?</AlertTitle>
        <AlertDescription>
          Once you're satisfied with this demo, we can convert it to production by:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Creating asset_sensor_readings database table for real IoT data</li>
            <li>Building digital-twin-service edge function for backend processing</li>
            <li>Integrating with your existing assets, GPS locations, and sensor systems</li>
            <li>Adding authentication and organization-specific data filtering</li>
            <li>Moving from /demo route to main navigation</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
