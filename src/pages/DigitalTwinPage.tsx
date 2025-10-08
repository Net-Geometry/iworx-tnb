/**
 * Digital Twin Visualization Page
 * 
 * Main production page for 3D asset visualization, real-time IoT data,
 * time-travel playback, and what-if simulations
 */

import { useState } from 'react';
import { Layers, Activity, History, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalTwinCanvas } from '@/components/digital-twin/DigitalTwinCanvas';
import { AssetInspectorPanel } from '@/components/digital-twin/AssetInspectorPanel';
import { TimelineScrubber } from '@/components/digital-twin/TimelineScrubber';
import { ScenarioBuilder } from '@/components/digital-twin/ScenarioBuilder';

export default function DigitalTwinPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('3d-view');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Layers className="h-8 w-8 text-primary" />
                Digital Twin Visualization
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time 3D asset monitoring and predictive analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="3d-view" className="gap-2">
              <Layers className="h-4 w-4" />
              3D Visualization
            </TabsTrigger>
            <TabsTrigger value="live-data" className="gap-2">
              <Activity className="h-4 w-4" />
              Live IoT Data
            </TabsTrigger>
            <TabsTrigger value="time-travel" className="gap-2">
              <History className="h-4 w-4" />
              Time Travel
            </TabsTrigger>
            <TabsTrigger value="simulations" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              What-If Scenarios
            </TabsTrigger>
          </TabsList>

          {/* 3D Visualization Tab */}
          <TabsContent value="3d-view" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main 3D Canvas */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-0">
                    <DigitalTwinCanvas
                      onAssetSelect={setSelectedAssetId}
                      selectedAssetId={selectedAssetId}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Asset Inspector Sidebar */}
              <div className="lg:col-span-1">
                <AssetInspectorPanel
                  assetId={selectedAssetId}
                  onClose={() => setSelectedAssetId(null)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Live IoT Data Tab */}
          <TabsContent value="live-data">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DigitalTwinCanvas
                      onAssetSelect={setSelectedAssetId}
                      selectedAssetId={selectedAssetId}
                      showIoTOverlays={true}
                    />
                  </div>
                  <div>
                    <AssetInspectorPanel
                      assetId={selectedAssetId}
                      showLiveData={true}
                      onClose={() => setSelectedAssetId(null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Travel Tab */}
          <TabsContent value="time-travel">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <DigitalTwinCanvas
                    onAssetSelect={setSelectedAssetId}
                    selectedAssetId={selectedAssetId}
                    historicalMode={true}
                    historicalTime={currentTime}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <TimelineScrubber
                    currentTime={currentTime}
                    onTimeChange={setCurrentTime}
                    onAssetSelect={setSelectedAssetId}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* What-If Scenarios Tab */}
          <TabsContent value="simulations">
            <ScenarioBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
