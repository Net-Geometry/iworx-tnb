/**
 * Timeline Scrubber Component
 * 
 * Time-travel playback controls with incident markers
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface TimelineScrubberProps {
  currentTime: Date;
  onTimeChange: (time: Date) => void;
  onAssetSelect?: (assetId: string) => void;
}

export function TimelineScrubber({
  currentTime,
  onTimeChange,
}: TimelineScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Time range: last 7 days
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const timeRange = endTime.getTime() - startTime.getTime();
  const currentPosition = ((currentTime.getTime() - startTime.getTime()) / timeRange) * 100;

  const handleSliderChange = (value: number[]) => {
    const newTime = new Date(startTime.getTime() + (timeRange * value[0]) / 100);
    onTimeChange(newTime);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual playback logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Time Travel Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Playback Speed */}
          <div className="ml-4 flex gap-1">
            {[1, 2, 5, 10].map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <Slider
            value={[currentPosition]}
            onValueChange={handleSliderChange}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{format(startTime, 'MMM dd, HH:mm')}</span>
            <span className="font-medium text-foreground">
              {format(currentTime, 'MMM dd, yyyy HH:mm:ss')}
            </span>
            <span>{format(endTime, 'MMM dd, HH:mm')}</span>
          </div>
        </div>

        {/* Incident Markers (placeholder) */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Incidents in timeframe:</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              🔴 Overheat Event
            </Button>
            <Button variant="outline" size="sm">
              ⚠️ Maintenance
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
