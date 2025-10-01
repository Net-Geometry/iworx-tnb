import { useState } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAssetMeterGroups } from '@/hooks/useAssetMeterGroups';
import { useMeterGroups } from '@/hooks/useMeterGroups';

interface AssetMeterGroupsTabProps {
  assetId: string;
}

/**
 * AssetMeterGroupsTab - Tab component showing meter groups assigned to an asset
 * Allows assigning/unassigning meter groups
 */
export function AssetMeterGroupsTab({ assetId }: AssetMeterGroupsTabProps) {
  const { assetMeterGroups, loading, assignMeterGroup, unassignMeterGroup } =
    useAssetMeterGroups(assetId);
  const { meterGroups } = useMeterGroups();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  // Get meter groups not already assigned to this asset
  const assignedGroupIds = assetMeterGroups.map((amg) => amg.meter_group_id);
  const availableGroups = meterGroups.filter(
    (mg) => mg.is_active && !assignedGroupIds.includes(mg.id)
  );

  const handleAssign = async () => {
    if (!selectedGroupId) return;
    await assignMeterGroup(selectedGroupId, purpose, notes);
    setIsAssignDialogOpen(false);
    setSelectedGroupId('');
    setPurpose('');
    setNotes('');
  };

  const handleUnassign = async (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this meter group from the asset?')) {
      await unassignMeterGroup(assignmentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assigned Meter Groups</h3>
          <p className="text-sm text-muted-foreground">
            Meter groups associated with this asset
          </p>
        </div>
        <Button onClick={() => setIsAssignDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Meter Group
        </Button>
      </div>

      {/* Meter Groups Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Number</TableHead>
              <TableHead>Group Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading meter groups...
                </TableCell>
              </TableRow>
            ) : assetMeterGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No meter groups assigned to this asset
                </TableCell>
              </TableRow>
            ) : (
              assetMeterGroups.map((amg: any) => (
                <TableRow key={amg.id}>
                  <TableCell className="font-medium">
                    {amg.meter_groups?.group_number || '-'}
                  </TableCell>
                  <TableCell>{amg.meter_groups?.name || '-'}</TableCell>
                  <TableCell>
                    {amg.meter_groups?.group_type && (
                      <Badge>{amg.meter_groups.group_type}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {amg.purpose || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(amg.assigned_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={amg.is_active ? 'default' : 'secondary'}>
                      {amg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnassign(amg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Meter Group to Asset</DialogTitle>
            <DialogDescription>
              Select a meter group to associate with this asset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meter-group">Meter Group *</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger id="meter-group">
                  <SelectValue placeholder="Select a meter group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.group_number} - {group.name} ({group.group_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Revenue monitoring, Load management"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!selectedGroupId}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}