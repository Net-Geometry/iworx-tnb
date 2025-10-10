import { useDeviceSensorMetrics } from '@/hooks/useDeviceSensorMetrics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MetricSelectorProps {
  deviceId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function MetricSelector({ deviceId, value, onValueChange, disabled }: MetricSelectorProps) {
  const { data: metrics, isLoading } = useDeviceSensorMetrics(deviceId);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const isDisabled = disabled || !deviceId || !metrics || metrics.length === 0;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isDisabled}>
      <SelectTrigger>
        <SelectValue placeholder={!deviceId ? "Select device first" : "Select a metric"} />
      </SelectTrigger>
      <SelectContent className="bg-background">
        {metrics && metrics.map((metric) => (
          <SelectItem key={metric.name} value={metric.name}>
            <div className="flex items-center gap-2">
              <span>
                {metric.name} {metric.unit && `(${metric.unit})`}
              </span>
              {metric.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{metric.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
