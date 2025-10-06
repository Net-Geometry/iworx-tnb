import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MeterGroup } from '@/hooks/useMeterGroups';
import { useMeterGroupAssignments } from '@/hooks/useMeterGroupAssignments';
import { useMeters } from '@/hooks/useMeters';

interface MeterGroupDetailsModalProps {
  meterGroup: MeterGroup;
  open: boolean;
  onClose: () => void;
}

/**
 * MeterGroupDetailsModal - Modal showing meter group details and assigned meters
 * Allows adding/removing meters from the group
 */
export function MeterGroupDetailsModal({
  meterGroup,
  open,
  onClose,
}: MeterGroupDetailsModalProps) {
  const { assignments, loading, assignMeter, unassignMeter } =
    useMeterGroupAssignments(meterGroup.id);
  const { meters } = useMeters(); // Still needed for assignment dropdown
  const [selectedMeterId, setSelectedMeterId] = useState<string>('');

  // Get meters not already assigned to this group
  const assignedMeterIds = assignments.map((a) => a.meter_id);
  const availableMeters = meters.filter(
    (m) => !assignedMeterIds.includes(m.id)
  );

  const handleAssign = async () => {
    if (!selectedMeterId) return;
    await assignMeter(selectedMeterId);
    setSelectedMeterId('');
  };

  const handleUnassign = async (assignmentId: string) => {
    await unassignMeter(assignmentId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Meter Group: {meterGroup.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Info */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Group Number</div>
                <div className="font-medium">{meterGroup.group_number}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <Badge>{meterGroup.group_type || 'N/A'}</Badge>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">Description</div>
                <div>{meterGroup.description || '-'}</div>
              </div>
            </div>
          </Card>

          {/* Add Meter Section */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Assign Meter to Group</h3>
            <div className="flex gap-2">
              <Select value={selectedMeterId} onValueChange={setSelectedMeterId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a meter" />
                </SelectTrigger>
                <SelectContent>
                  {availableMeters.map((meter) => (
                    <SelectItem key={meter.id} value={meter.id}>
                      {meter.meter_number} - {meter.serial_number} (
                      {meter.meter_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssign}
                disabled={!selectedMeterId}
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign
              </Button>
            </div>
          </Card>

          {/* Assigned Meters Table */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                Assigned Meters ({assignments.length})
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meter Number</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No meters assigned to this group
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.meters?.meter_number || '-'}
                      </TableCell>
                      <TableCell>{assignment.meters?.serial_number || '-'}</TableCell>
                      <TableCell>
                        <Badge>{assignment.meters?.meter_type || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{assignment.meters?.status || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.assigned_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassign(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}