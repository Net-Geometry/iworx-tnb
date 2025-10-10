/**
 * TNB Grid Demo Page
 * 
 * Demonstration of electrical grid digital twin visualization
 */

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Info, 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Power,
  Database
} from 'lucide-react';
import { GridVisualization3D } from './tnb-grid/components/GridVisualization3D';
import { GridInspectorPanel } from './tnb-grid/components/GridInspectorPanel';
import { useMockGridData } from './tnb-grid/hooks/useMockGridData';
import { mockGridZones } from './tnb-grid/mock-data/mockGridData';

export default function TNBGridDemo() {
  const [selectedSubstationId, setSelectedSubstationId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [showLoadFlow, setShowLoadFlow] = useState(true);
  const [activeTab, setActiveTab] = useState('grid-viz');

  const { substations, powerLines } = useMockGridData();

  const selectedSubstation = substations.find(s => s.id === selectedSubstationId);
  const selectedLine = powerLines.find(l => l.id === selectedLineId);

  const handleSubstationClick = (id: string) => {
    setSelectedSubstationId(id);
    setSelectedLineId(null);
  };

  const handleLineClick = (id: string) => {
    setSelectedLineId(id);
    setSelectedSubstationId(null);
  };

  const handleClose = () => {
    setSelectedSubstationId(null);
    setSelectedLineId(null);
  };

  // Calculate statistics
  const totalCapacity = substations.reduce((sum, s) => sum + s.capacity_mva, 0);
  const totalLoad = substations.reduce((sum, s) => sum + s.current_load_mva, 0);
  const totalCustomers = substations.reduce((sum, s) => sum + s.customers_served, 0);
  const utilizationPercent = (totalLoad / totalCapacity) * 100;
  const energizedCount = substations.filter(s => s.status === 'energized').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">TNB Grid Digital Twin</h1>
              <Badge variant="secondary">Demo</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Interactive 3D visualization of electrical grid infrastructure
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a demonstration page showing TNB's electrical grid digital twin capabilities.
            All data is simulated for demonstration purposes. Click on substations or power lines to view details.
          </AlertDescription>
        </Alert>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Power className="h-4 w-4 text-muted-foreground" />
                Total Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalCapacity)} MVA</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {substations.length} substations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Current Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalLoad)} MVA</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(utilizationPercent)}% utilization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {mockGridZones.length} zones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Grid Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{energizedCount}/{substations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Substations energized
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="grid-viz">Grid Visualization</TabsTrigger>
            <TabsTrigger value="features">Features Overview</TabsTrigger>
            <TabsTrigger value="implementation">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="grid-viz" className="space-y-4">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visualization Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="load-flow">Show Load Flow Animation</Label>
                    <p className="text-sm text-muted-foreground">
                      Displays animated particles showing electricity flow
                    </p>
                  </div>
                  <Switch
                    id="load-flow"
                    checked={showLoadFlow}
                    onCheckedChange={setShowLoadFlow}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Voltage Level Legend</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }} />
                      <span className="text-sm">500kV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EA580C' }} />
                      <span className="text-sm">275kV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EAB308' }} />
                      <span className="text-sm">132kV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16A34A' }} />
                      <span className="text-sm">33kV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563EB' }} />
                      <span className="text-sm">11kV</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3D Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">3D Grid View</CardTitle>
                    <CardDescription>
                      Click and drag to rotate • Scroll to zoom • Click equipment for details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GridVisualization3D
                      selectedSubstationId={selectedSubstationId}
                      selectedLineId={selectedLineId}
                      onSubstationClick={handleSubstationClick}
                      onLineClick={handleLineClick}
                      showLoadFlow={showLoadFlow}
                    />
                  </CardContent>
                </Card>
              </div>

              <div>
                <GridInspectorPanel
                  substation={selectedSubstation}
                  line={selectedLine}
                  onClose={handleClose}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Features Demonstrated</CardTitle>
                <CardDescription>
                  This demo showcases the core capabilities of TNB's grid digital twin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    3D Grid Topology
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete electrical network visualization in 3D space with hierarchical voltage levels
                    (500kV transmission backbone down to 11kV distribution).
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Real-Time Monitoring
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Simulated live load data with status indicators, fault detection visualization,
                    and automatic updates every 3 seconds to show dynamic grid conditions.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Interactive Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click any equipment for detailed information including load percentages, capacity,
                    voltage levels, and customer impact. Pan, rotate, and zoom for different perspectives.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Operational Scenarios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visual representation of various operational states including energized lines,
                    equipment under maintenance, and potential fault conditions.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Customer Impact
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Each substation shows the number of customers served, enabling quick assessment
                    of outage impact and service restoration prioritization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
                <CardDescription>
                  Built with modern web technologies for high performance 3D visualization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Technology Stack</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>React Three Fiber - 3D rendering engine</li>
                    <li>Three.js - WebGL 3D graphics library</li>
                    <li>React Three Drei - 3D component helpers</li>
                    <li>TypeScript - Type-safe development</li>
                    <li>Tailwind CSS - Modern styling</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Performance Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>60 FPS rendering with 7+ substations and 7+ power lines</li>
                    <li>Smooth camera controls with orbit navigation</li>
                    <li>Efficient particle system for load flow animation</li>
                    <li>Real-time data updates without performance impact</li>
                    <li>Responsive design for desktop and tablet devices</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Demo Data Structure</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
{`interface GridSubstation {
  id: string;
  name: string;
  position: [x, y, z];
  voltageLevel: '500kV' | '275kV' | '132kV' | '33kV' | '11kV';
  status: 'energized' | 'de-energized' | 'maintenance' | 'fault';
  capacity_mva: number;
  current_load_mva: number;
  customers_served: number;
}

interface GridPowerLine {
  id: string;
  from_substation_id: string;
  to_substation_id: string;
  voltageLevel: string;
  capacity_mva: number;
  current_load_mva: number;
  line_path: [x, y, z][];
}`}
                    </pre>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Production Integration Path
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    To move from demo to production with real TNB data:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Create <code className="text-xs bg-muted px-1 py-0.5 rounded">grid_connections</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded">grid_zones</code> database tables</li>
                    <li>Build <code className="text-xs bg-muted px-1 py-0.5 rounded">grid-analytics-service</code> Edge Function for load flow calculations</li>
                    <li>Integrate with SCADA system for real-time data ingestion</li>
                    <li>Add organization-specific filtering and user permissions</li>
                    <li>Implement historical data playback and predictive analytics</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">File Structure</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
{`src/pages/demo/tnb-grid/
├── mock-data/
│   └── mockGridData.ts          # Demo data
├── hooks/
│   └── useMockGridData.ts       # Simulated real-time updates
├── components/
│   ├── PowerLine3D.tsx          # 3D power line rendering
│   ├── Substation3D.tsx         # 3D substation models
│   ├── LoadFlowParticles.tsx    # Animated flow particles
│   ├── GridVisualization3D.tsx  # Main 3D scene
│   └── GridInspectorPanel.tsx   # Details panel
└── TNBGridDemo.tsx              # Main demo page`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Removal Instructions:</strong> To remove this demo, simply delete the{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">src/pages/demo/tnb-grid/</code> folder
                and the <code className="text-xs bg-muted px-1 py-0.5 rounded">src/pages/demo/TNBGridDemo.tsx</code> file.
                All demo code is self-contained and won't affect other parts of the system.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
