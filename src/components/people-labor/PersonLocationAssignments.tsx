import React, { useState } from 'react';
import { Plus, Trash2, Star, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePersonLocations, useLocationEngineers, useAssignPersonLocation, useUnassignPersonLocation, useUpdatePersonLocation } from '@/hooks/usePersonLocations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/**
 * PersonLocationAssignments Component
 * Manages engineer assignments to locations (Level 4 hierarchy nodes)
 */
interface PersonLocationAssignmentsProps {
  personId: string;
}

export const PersonLocationAssignments: React.FC<PersonLocationAssignmentsProps> = ({ personId }) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedHierarchyNodeId, setSelectedHierarchyNodeId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');
  const [viewLocationId, setViewLocationId] = useState<string>('');

  const { data: personLocations = [], isLoading } = usePersonLocations(personId);
  const { data: locationEngineers = [] } = useLocationEngineers(viewLocationId);
  const assignLocation = useAssignPersonLocation();
  const unassignLocation = useUnassignPersonLocation();
  const updateLocation = useUpdatePersonLocation();

  // Fetch all Level 4 (Location) nodes
  const { data: level4Nodes = [] } = useQuery({
    queryKey: ['hierarchy-level-4-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hierarchy_nodes')
        .select(`
          id,
          name,
          path,
          hierarchy_levels!inner (
            id,
            name,
            level_order
          )
        `)
        .eq('hierarchy_levels.level_order', 4)
        .order('path');

      if (error) throw error;
      return data || [];
    },
  });

  const handleAssignLocation = async () => {
    if (!selectedHierarchyNodeId) return;

    await assignLocation.mutateAsync({
      person_id: personId,
      hierarchy_node_id: selectedHierarchyNodeId,
      is_primary: isPrimary,
      notes: notes || undefined,
    });

    setAssignDialogOpen(false);
    setSelectedHierarchyNodeId('');
    setIsPrimary(false);
    setNotes('');
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;

    await unassignLocation.mutateAsync({
      id: selectedLocation.id,
      person_id: personId,
      hierarchy_node_id: selectedLocation.hierarchy_node_id,
    });

    setDeleteDialogOpen(false);
    setSelectedLocation(null);
  };

  const handleSetPrimary = async (location: any) => {
    await updateLocation.mutateAsync({
      id: location.id,
      person_id: personId,
      hierarchy_node_id: location.hierarchy_node_id,
      is_primary: true,
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assigned Locations</CardTitle>
            <CardDescription>
              Manage location assignments for notification routing
            </CardDescription>
          </div>
          <Button onClick={() => setAssignDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assign Location
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-locations">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-locations">
              My Locations
              {personLocations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {personLocations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="by-location">Engineers by Location</TabsTrigger>
          </TabsList>

          {/* My Locations Tab */}
          <TabsContent value="my-locations" className="space-y-4">
            {personLocations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No locations assigned</p>
                <p className="text-sm">Assign locations to receive work order notifications</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Hierarchy Path</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personLocations.map((location: any) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">{location.hierarchy_nodes?.name}</span>
                          {location.is_primary && (
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {location.hierarchy_nodes?.path}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(location.assigned_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={location.is_active ? 'default' : 'secondary'}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!location.is_primary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetPrimary(location)}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLocation(location);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Engineers by Location Tab */}
          <TabsContent value="by-location" className="space-y-4">
            <div className="space-y-4">
              <Label>Select Location</Label>
              <Select value={viewLocationId} onValueChange={setViewLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a location to view engineers" />
                </SelectTrigger>
                <SelectContent>
                  {level4Nodes.map((node: any) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.path} / {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {viewLocationId && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{locationEngineers.length} engineers assigned</span>
                </div>

                {locationEngineers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No engineers assigned to this location</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {locationEngineers.map((engineer: any) => (
                      <Card key={engineer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(
                                  engineer.people?.first_name,
                                  engineer.people?.last_name
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {engineer.people?.first_name} {engineer.people?.last_name}
                                </p>
                                {engineer.is_primary && (
                                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {engineer.people?.job_title || 'No title'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {engineer.people?.email}
                              </p>
                            </div>
                            <Badge variant={engineer.people?.employment_status === 'active' ? 'default' : 'secondary'}>
                              {engineer.people?.employment_status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Assign Location Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Location</DialogTitle>
            <DialogDescription>
              Assign this person to a location for work order notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={selectedHierarchyNodeId} onValueChange={setSelectedHierarchyNodeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {level4Nodes
                    .filter((node: any) => 
                      !personLocations.find((pl: any) => pl.hierarchy_node_id === node.id)
                    )
                    .map((node: any) => (
                      <SelectItem key={node.id} value={node.id}>
                        <div>
                          <div className="font-medium">{node.name}</div>
                          <div className="text-xs text-muted-foreground">{node.path}</div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Set as primary location</Label>
              <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this assignment"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignLocation}
              disabled={!selectedHierarchyNodeId || assignLocation.isPending}
            >
              Assign Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Location Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This person will no longer receive notifications for work orders at this location.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
