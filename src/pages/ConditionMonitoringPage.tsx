import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from 'lucide-react';
import { ConditionKPICards } from '@/components/condition-monitoring/ConditionKPICards';
import { AssetConditionGrid } from '@/components/condition-monitoring/AssetConditionGrid';
import { ActiveAlarmsList } from '@/components/condition-monitoring/ActiveAlarmsList';
import { ThresholdManagement } from '@/components/condition-monitoring/ThresholdManagement';
import { ConditionInspectorPanel } from '@/components/condition-monitoring/ConditionInspectorPanel';

export default function ConditionMonitoringPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Condition-Based Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time asset health surveillance with automated corrective actions
          </p>
        </div>
      </div>

      <ConditionKPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Monitored Assets</CardTitle>
              <CardDescription>
                Assets with IoT sensors and condition thresholds configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="alarms">Active Alarms</TabsTrigger>
                  <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <AssetConditionGrid
                    onAssetSelect={setSelectedAssetId}
                    selectedAssetId={selectedAssetId}
                  />
                </TabsContent>

                <TabsContent value="alarms" className="space-y-4">
                  <ActiveAlarmsList onAssetSelect={setSelectedAssetId} />
                </TabsContent>

                <TabsContent value="thresholds" className="space-y-4">
                  <ThresholdManagement />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Historical trends coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ConditionInspectorPanel assetId={selectedAssetId} />
        </div>
      </div>
    </div>
  );
}
