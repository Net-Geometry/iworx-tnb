import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTestFormReadings } from '@/hooks/useTestFormReadings';
import { Gauge, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MeterGroupInfo {
  id: string;
  name: string;
  group_number?: string;
  description?: string;
}

interface TestFormTabProps {
  workOrderId: string;
  matchingMeterGroups: MeterGroupInfo[];
}

/**
 * Test Form tab for recording meter readings during work order execution
 */
export function TestFormTab({ workOrderId, matchingMeterGroups }: TestFormTabProps) {
  const { readings, loading, saveReading } = useTestFormReadings(workOrderId);
  const [readingValues, setReadingValues] = useState<Record<string, string>>({});
  const [readingNotes, setReadingNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleSaveReading = async (meterGroupId: string) => {
    const value = readingValues[meterGroupId];
    if (!value || isNaN(Number(value))) {
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [meterGroupId]: true }));
      await saveReading(
        meterGroupId,
        Number(value),
        readingNotes[meterGroupId] || undefined
      );
      // Clear the input after successful save
      setReadingValues(prev => ({ ...prev, [meterGroupId]: '' }));
      setReadingNotes(prev => ({ ...prev, [meterGroupId]: '' }));
    } catch (error) {
      console.error('Error saving reading:', error);
    } finally {
      setSaving(prev => ({ ...prev, [meterGroupId]: false }));
    }
  };

  const getLatestReading = (meterGroupId: string) => {
    return readings.find(r => r.meter_group_id === meterGroupId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading test form...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Gauge className="h-4 w-4" />
        <span>
          Record meter readings for {matchingMeterGroups.length} meter group(s) associated with this work order
        </span>
      </div>

      {matchingMeterGroups.map((meterGroup) => {
        const latestReading = getLatestReading(meterGroup.id);
        
        return (
          <Card key={meterGroup.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                {meterGroup.name}
                {meterGroup.group_number && (
                  <span className="text-sm text-muted-foreground">
                    ({meterGroup.group_number})
                  </span>
                )}
              </CardTitle>
              {meterGroup.description && (
                <CardDescription>{meterGroup.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Previous Reading */}
              {latestReading && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Previous Reading</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(latestReading.reading_date), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{latestReading.reading_value}</div>
                  {latestReading.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{latestReading.notes}</p>
                  )}
                </div>
              )}

              {/* New Reading Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`reading-${meterGroup.id}`}>
                    New Reading Value *
                  </Label>
                  <Input
                    id={`reading-${meterGroup.id}`}
                    type="number"
                    step="0.01"
                    placeholder="Enter reading value"
                    value={readingValues[meterGroup.id] || ''}
                    onChange={(e) => setReadingValues(prev => ({
                      ...prev,
                      [meterGroup.id]: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor={`notes-${meterGroup.id}`}>
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id={`notes-${meterGroup.id}`}
                    placeholder="Add any observations or comments..."
                    value={readingNotes[meterGroup.id] || ''}
                    onChange={(e) => setReadingNotes(prev => ({
                      ...prev,
                      [meterGroup.id]: e.target.value
                    }))}
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={() => handleSaveReading(meterGroup.id)}
                  disabled={
                    !readingValues[meterGroup.id] || 
                    isNaN(Number(readingValues[meterGroup.id])) ||
                    saving[meterGroup.id]
                  }
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving[meterGroup.id] ? 'Saving...' : 'Save Reading'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
