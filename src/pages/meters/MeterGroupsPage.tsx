import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMeterGroups, MeterGroup } from '@/hooks/useMeterGroups';
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
} from '@/components/ui/dialog';
import { MeterGroupForm } from '@/components/meters/MeterGroupForm';
import { MeterGroupDetailsModal } from '@/components/meters/MeterGroupDetailsModal';

/**
 * MeterGroupsPage - Page for managing meter groups
 * Displays all meter groups with filtering and CRUD operations
 */
export default function MeterGroupsPage() {
  const { meterGroups, loading } = useMeterGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MeterGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter groups based on search
  const filteredGroups = meterGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.group_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupTypeColor = (type?: string) => {
    const colors = {
      revenue: 'bg-primary',
      monitoring: 'bg-secondary',
      zone: 'bg-accent',
      feeder: 'bg-muted',
    };
    return type ? colors[type as keyof typeof colors] || 'bg-muted' : 'bg-muted';
  };

  const handleEdit = (group: MeterGroup) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  const handleView = (group: MeterGroup) => {
    setSelectedGroup(group);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedGroup(null);
    setIsFormOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meter Groups</h1>
            <p className="text-muted-foreground">
              Organize meters into logical groups
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <Input
            placeholder="Search by group name, number, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Groups Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading meter groups...
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No meter groups found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      {group.group_number}
                    </TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      {group.group_type && (
                        <Badge className={getGroupTypeColor(group.group_type)}>
                          {group.group_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {group.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.is_active ? 'default' : 'secondary'}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(group)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(group)}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Group Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Edit Meter Group' : 'Create New Meter Group'}
            </DialogTitle>
          </DialogHeader>
          <MeterGroupForm
            meterGroup={selectedGroup}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedGroup(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Group Details Modal */}
      {selectedGroup && (
        <MeterGroupDetailsModal
          meterGroup={selectedGroup}
          open={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </Layout>
  );
}