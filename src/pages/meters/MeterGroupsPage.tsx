import { useState } from 'react';
import { Plus, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMeterGroups, MeterGroup } from '@/hooks/useMeterGroups';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MeterGroupKPICards } from '@/components/meters/MeterGroupKPICards';
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
    <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/meters">Meters</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Meter Groups</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meter Groups</h1>
              <p className="text-muted-foreground mt-1">
                Organize and manage meters into logical groups for better monitoring
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} size="lg" className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* KPI Cards */}
        <MeterGroupKPICards meterGroups={meterGroups} />

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Search by group name, number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-md"
            />
          </div>
        </Card>

        {/* Groups Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading meter groups...</p>
              </div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No meter groups found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {searchTerm
                  ? 'Try adjusting your search terms or create a new meter group.'
                  : 'Get started by creating your first meter group to organize your meters.'}
              </p>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Meter Group
              </Button>
            </div>
          ) : (
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
                {filteredGroups.map((group) => (
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
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

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
    </div>
  );
}