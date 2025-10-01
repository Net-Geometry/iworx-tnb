import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePeople } from '@/hooks/usePeople';
import { usePersonSkills } from '@/hooks/usePersonSkills';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useSkills } from '@/hooks/useSkills';
import { useTeams } from '@/hooks/useTeams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Award,
  Users,
  Shield,
  User,
  DollarSign,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

/**
 * PersonDetailPage - Displays comprehensive person profile information
 * Shows personal details, skills, team memberships, and system access
 */
const PersonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Fetch person data
  const { people, isLoading: peopleLoading } = usePeople();
  const person = people.find(p => p.id === id);
  
  // Fetch related data
  const { personSkills, isLoading: skillsLoading } = usePersonSkills(id);
  const { teamMembers, isLoading: teamsLoading } = useTeamMembers(id);
  const { skills } = useSkills();
  const { teams } = useTeams();

  // Loading state
  if (peopleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Not found state
  if (!person) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Person Not Found</h1>
          <p className="text-muted-foreground">The person you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/people-labor/people')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to People
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date?: string) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-success',
      inactive: 'bg-muted',
      on_leave: 'bg-warning',
      terminated: 'bg-destructive'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const getProficiencyColor = (level: string) => {
    const colors = {
      beginner: 'bg-blue-500',
      intermediate: 'bg-green-500',
      advanced: 'bg-orange-500',
      expert: 'bg-purple-500'
    };
    return colors[level as keyof typeof colors] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/people-labor/people">People & Labor</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{person.first_name} {person.last_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/people-labor/people')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to People
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {person.first_name} {person.last_name}
          </h1>
          <p className="text-lg text-muted-foreground">Employee #{person.employee_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Person
          </Button>
        </div>
      </div>

      {/* Person Overview Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="text-center">
                <Badge className={getStatusColor(person.employment_status)}>
                  {person.employment_status}
                </Badge>
                {person.user_id && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      <UserCheck className="w-3 h-3 mr-1" />
                      System Access
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{person.email || 'N/A'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{person.phone || 'N/A'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                <div className="mt-1 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{person.job_title || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm text-foreground mt-1">{person.department || 'N/A'}</p>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{formatDate(person.hire_date)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                <div className="mt-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {person.hourly_rate ? `$${person.hourly_rate}/hr` : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Skills Count</label>
                <div className="mt-1 flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{personSkills.length} skills</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Team Memberships</label>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{teamMembers.length} teams</span>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Certifications</label>
                <div className="mt-2 space-y-2">
                  {person.certifications && person.certifications.length > 0 ? (
                    person.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline" className="mr-2">
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="skills">Skills ({personSkills.length})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="access">System Access</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.notes ? (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{person.notes}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No additional notes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills & Proficiency
              </CardTitle>
              <CardDescription>Skills assigned to this person</CardDescription>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : personSkills.length > 0 ? (
                <div className="space-y-4">
                  {personSkills.map((personSkill: any) => {
                    const skill = skills.find(s => s.id === personSkill.skill_id);
                    return (
                      <div key={personSkill.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{skill?.skill_name || 'Unknown Skill'}</h4>
                            <p className="text-sm text-muted-foreground">{skill?.category}</p>
                          </div>
                          <Badge className={getProficiencyColor(personSkill.proficiency_level)}>
                            {personSkill.proficiency_level}
                          </Badge>
                        </div>
                        <Separator className="my-2" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Experience: </span>
                            <span className="text-foreground">{personSkill.years_experience || 0} years</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Certified: </span>
                            <span className="text-foreground">{personSkill.certified ? 'Yes' : 'No'}</span>
                          </div>
                          {personSkill.certification_date && (
                            <div>
                              <span className="text-muted-foreground">Cert. Date: </span>
                              <span className="text-foreground">{formatDate(personSkill.certification_date)}</span>
                            </div>
                          )}
                          {personSkill.certification_expiry && (
                            <div>
                              <span className="text-muted-foreground">Expiry: </span>
                              <span className="text-foreground">{formatDate(personSkill.certification_expiry)}</span>
                            </div>
                          )}
                        </div>
                        {personSkill.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{personSkill.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No skills assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Memberships
              </CardTitle>
              <CardDescription>Teams this person belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((membership) => (
                    <div key={membership.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{membership.teams?.team_name}</h4>
                          <p className="text-sm text-muted-foreground">{membership.teams?.description}</p>
                        </div>
                        <Badge variant="outline">
                          {membership.role_in_team}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Assigned: {formatDate(membership.assigned_date || undefined)}</span>
                        <span className={membership.is_active ? 'text-success' : 'text-muted-foreground'}>
                          {membership.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Not assigned to any teams</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Access Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Access
              </CardTitle>
              <CardDescription>User account and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {person.user_id ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <UserCheck className="h-5 w-5" />
                    <span className="font-medium">System access enabled</span>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm text-foreground mt-1 font-mono">{person.user_id}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This person has an active user account and can access the system.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No System Access</h3>
                  <p className="text-muted-foreground mb-4">
                    This person does not have a user account to access the system.
                  </p>
                  <Button variant="outline">
                    Link User Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog - TODO: Create dedicated EditPersonDialog */}
      {/* <AddPersonDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      /> */}
    </div>
  );
};

export default PersonDetailPage;
