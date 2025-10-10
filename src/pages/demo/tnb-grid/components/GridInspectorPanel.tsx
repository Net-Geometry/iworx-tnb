/**
 * Grid Inspector Panel Component
 * 
 * Shows detailed information about selected grid equipment
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Zap, Activity, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type GridSubstation, type GridPowerLine } from '../mock-data/mockGridData';

interface GridInspectorPanelProps {
  substation?: GridSubstation | null;
  line?: GridPowerLine | null;
  onClose: () => void;
}

export function GridInspectorPanel({ substation, line, onClose }: GridInspectorPanelProps) {
  if (!substation && !line) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Grid Inspector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click on any substation or power line to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  if (substation) {
    const loadPercent = (substation.current_load_mva / substation.capacity_mva) * 100;
    
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {substation.name}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant={substation.status === 'energized' ? 'default' : 'secondary'}>
              {substation.status}
            </Badge>
            <Badge variant="outline">{substation.voltageLevel}</Badge>
            <Badge variant="outline">{substation.type.replace('_', ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Load Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Load:</span>
                <span className="font-medium">{substation.current_load_mva} MVA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">{substation.capacity_mva} MVA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Utilization:</span>
                <span className={`font-medium ${
                  loadPercent > 80 ? 'text-destructive' : 
                  loadPercent > 60 ? 'text-amber-500' : 
                  'text-green-500'
                }`}>
                  {Math.round(loadPercent)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    loadPercent > 80 ? 'bg-destructive' : 
                    loadPercent > 60 ? 'bg-amber-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${loadPercent}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Customer Impact</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customers Served:</span>
                <span className="font-medium">{substation.customers_served.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Technical Details</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Voltage Level:</span>
                <span className="font-medium">{substation.voltageLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{substation.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (line) {
    const loadPercent = (line.current_load_mva / line.capacity_mva) * 100;
    
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Power Line
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant={line.status === 'energized' ? 'default' : 'secondary'}>
              {line.status}
            </Badge>
            <Badge variant="outline">{line.voltageLevel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Load Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Load:</span>
                <span className="font-medium">{line.current_load_mva} MVA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">{line.capacity_mva} MVA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Utilization:</span>
                <span className={`font-medium ${
                  loadPercent > 80 ? 'text-destructive' : 
                  loadPercent > 60 ? 'text-amber-500' : 
                  'text-green-500'
                }`}>
                  {Math.round(loadPercent)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    loadPercent > 80 ? 'bg-destructive' : 
                    loadPercent > 60 ? 'bg-amber-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${loadPercent}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Technical Details</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Voltage Level:</span>
                <span className="font-medium">{line.voltageLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Line ID:</span>
                <span className="font-medium">{line.id}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
