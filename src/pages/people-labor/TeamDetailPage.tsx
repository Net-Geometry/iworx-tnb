import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTeam } from "@/hooks/useTeam";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Mail, Phone, Calendar, Edit, UserPlus, Shield } from "lucide-react";
import { AddTeamMemberDialog } from "@/components/people-labor/AddTeamMemberDialog";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * TeamDetailPage - Displays comprehensive information about a specific team
 * 
 * Features:
 * - Team overview with basic information
 * - Member list with roles and contact information
 * - Member management (add/remove, role assignment)
 * - Team statistics and metrics
 */
export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { team, isLoading, updateTeamMemberRole } = useTeam(id);
  const { removeTeamMember } = useTeams();
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading team details...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-muted-foreground">Team not found</div>
        <Button onClick={() => navigate("/people-labor/teams")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>
      </div>
    );
  }

  const activeMembers = team.team_members.filter(m => m.is_active);
  const leader = activeMembers.find(m => m.role_in_team === 'leader');
  const supervisors = activeMembers.filter(m => m.role_in_team === 'supervisor');
  const members = activeMembers.filter(m => m.role_in_team === 'member');

  const getShiftBadge = (shift?: string) => {
    switch (shift) {
      case 'day': return <Badge variant="default">Day Shift</Badge>;
      case 'night': return <Badge variant="secondary">Night Shift</Badge>;
      case 'swing': return <Badge variant="outline">Swing Shift</Badge>;
      case 'rotating': return <Badge>Rotating</Badge>;
      default: return null;
    }
  };

  const handleRoleChange = (memberId: string, newRole: 'leader' | 'member' | 'supervisor') => {
    updateTeamMemberRole.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    removeTeamMember.mutate(memberId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/people-labor/teams")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{team.team_name}</h1>
            <p className="text-muted-foreground">Team Code: {team.team_code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Team
          </Button>
          <Button onClick={() => setShowAddMemberDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <Separator />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Leader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {leader?.people ? `${leader.people.first_name} ${leader.people.last_name}` : 'Not Assigned'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{team.department || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={team.is_active ? "default" : "secondary"}>
              {team.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({activeMembers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Basic details about the team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Team Name</label>
                  <p className="text-base mt-1">{team.team_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Team Code</label>
                  <p className="text-base mt-1">{team.team_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-base mt-1">{team.department || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shift</label>
                  <div className="mt-1">{getShiftBadge(team.shift || undefined)}</div>
                </div>
              </div>
              {team.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base mt-1">{team.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {/* Team Leader */}
          {leader && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Team Leader
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {leader.people?.first_name} {leader.people?.last_name}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {leader.people?.email}
                      </div>
                      {leader.people?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {leader.people.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Assigned: {format(new Date(leader.assigned_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge>Leader</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supervisors */}
          {supervisors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Supervisors ({supervisors.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supervisors.map((supervisor) => (
                  <div key={supervisor.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        {supervisor.people?.first_name} {supervisor.people?.last_name}
                      </h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {supervisor.people?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={supervisor.role_in_team}
                        onValueChange={(value) => handleRoleChange(supervisor.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leader">Leader</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this member from the team?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMember(supervisor.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No team members assigned yet</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        {member.people?.first_name} {member.people?.last_name}
                      </h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {member.people?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role_in_team}
                        onValueChange={(value) => handleRoleChange(member.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leader">Leader</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this member from the team?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <AddTeamMemberDialog
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
        teamId={id!}
        existingMemberIds={activeMembers.map(m => m.person_id)}
      />
    </div>
  );
}
