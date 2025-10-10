/**
 * Live Data Bottom Panel Component
 * 
 * Collapsible panel with Legend, Recent Alerts, and Statistics tabs
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSensorIcon, getSensorColor } from '@/lib/sensorColors';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeIoTData } from '@/hooks/useRealtimeIoTData';

interface LiveDataBottomPanelProps {
  assetId: string;
  sensorTypes: string[];
}

export function LiveDataBottomPanel({ assetId, sensorTypes }: LiveDataBottomPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { readings } = useRealtimeIoTData([assetId]);
  
  const assetReadings = readings[assetId] || [];
  const recentAlerts = assetReadings.filter(r => r.alert_threshold_exceeded).slice(0, 5);

  // Calculate statistics for each sensor type
  const stats = sensorTypes.map(sensorType => {
    const typeReadings = assetReadings.filter(r => r.sensor_type === sensorType);
    if (typeReadings.length === 0) return null;

    const values = typeReadings.map(r => r.reading_value);
    const unit = typeReadings[0]?.unit || '';

    return {
      sensorType,
      unit,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  }).filter(Boolean);

  return (
    <Card className={cn(
      "transition-all duration-300",
      isCollapsed ? "h-14" : "h-[300px]"
    )}>
      <CardHeader className="py-3 px-4 border-b cursor-pointer hover:bg-accent/50" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Live Data Information</CardTitle>
          <div className="flex items-center gap-2">
            {recentAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {recentAlerts.length} Alert{recentAlerts.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="p-4">
          <Tabs defaultValue="legend" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="legend">Legend</TabsTrigger>
              <TabsTrigger value="alerts">
                Alerts
                {recentAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">{recentAlerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            {/* Legend Tab */}
            <TabsContent value="legend" className="space-y-2 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sensorTypes.map(sensorType => {
                  const iconName = getSensorIcon(sensorType);
                  const IconComponent = (Icons as any)[iconName] || Icons.Activity;
                  const color = getSensorColor(sensorType);
                  const unit = assetReadings.find(r => r.sensor_type === sensorType)?.unit || '';

                  return (
                    <div 
                      key={sensorType}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                    >
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <IconComponent className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium capitalize truncate">
                          {sensorType}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {unit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-2 mt-4">
              {recentAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No recent alerts</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentAlerts.map((alert, idx) => {
                    const timeSince = Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 1000 / 60);
                    return (
                      <div 
                        key={alert.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{alert.sensor_type}</span>
                            <Badge variant="destructive" className="text-xs">
                              {alert.reading_value.toFixed(1)} {alert.unit}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeSince < 1 ? 'Just now' : `${timeSince} min${timeSince > 1 ? 's' : ''} ago`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-2 mt-4">
              {stats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No statistics available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {stats.map(stat => {
                    if (!stat) return null;
                    return (
                      <div 
                        key={stat.sensorType}
                        className="p-3 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{stat.sensorType}</span>
                          <Badge variant="outline" className="text-xs">
                            {stat.count} reading{stat.count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Min</div>
                            <div className="font-semibold">{stat.min.toFixed(1)} {stat.unit}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Avg</div>
                            <div className="font-semibold">{stat.avg.toFixed(1)} {stat.unit}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Max</div>
                            <div className="font-semibold">{stat.max.toFixed(1)} {stat.unit}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
