/**
 * Timeline Scrubber Component
 * Controls for time-travel playback
 */

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { SkipBack, Rewind, Play, Pause, FastForward, SkipForward } from 'lucide-react';
import { format } from 'date-fns';

interface DemoTimelineScrubberProps {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  isPlaying: boolean;
  playbackSpeed: number;
  onTimeChange: (time: Date) => void;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onSkipToIncident?: (incidentTime: Date) => void;
}

export function DemoTimelineScrubber({
  currentTime,
  startTime,
  endTime,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  onPlayPause,
  onSpeedChange,
}: DemoTimelineScrubberProps) {
  const totalDuration = endTime.getTime() - startTime.getTime();
  const progress = ((currentTime.getTime() - startTime.getTime()) / totalDuration) * 100;

  const handleSliderChange = (value: number[]) => {
    const newTime = new Date(startTime.getTime() + (value[0] / 100) * totalDuration);
    onTimeChange(newTime);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      {/* Timeline Slider */}
      <div className="space-y-2">
        <Slider
          value={[progress]}
          onValueChange={handleSliderChange}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{format(startTime, 'MMM d, HH:mm')}</span>
          <span className="font-semibold text-foreground">
            {format(currentTime, 'MMM d, yyyy HH:mm:ss')}
          </span>
          <span>{format(endTime, 'MMM d, HH:mm')}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTimeChange(startTime)}
            title="Skip to start"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newTime = new Date(currentTime.getTime() - 60 * 60 * 1000);
              onTimeChange(newTime < startTime ? startTime : newTime);
            }}
            title="Rewind 1 hour"
          >
            <Rewind className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="default" onClick={onPlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
              onTimeChange(newTime > endTime ? endTime : newTime);
            }}
            title="Forward 1 hour"
          >
            <FastForward className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTimeChange(endTime)}
            title="Skip to end"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Speed:</span>
          {[1, 2, 5, 10].map((speed) => (
            <Button
              key={speed}
              size="sm"
              variant={playbackSpeed === speed ? 'default' : 'outline'}
              onClick={() => onSpeedChange(speed)}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
