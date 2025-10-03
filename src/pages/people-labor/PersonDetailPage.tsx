import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePerson } from '@/hooks/usePerson';
import { usePeople, Person } from '@/hooks/usePeople';
import { usePersonSkills } from '@/hooks/usePersonSkills';
import { usePersonCrafts } from '@/hooks/usePersonCrafts';
import { usePersonBusinessAreas, useRemoveBusinessArea, useSetPrimaryBusinessArea } from '@/hooks/usePersonBusinessAreas';
import { useSkills } from '@/hooks/useSkills';
import { useCrafts } from '@/hooks/useCrafts';
import { useBusinessAreas } from '@/hooks/useBusinessAreas';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { PersonProfileEditForm } from '@/components/people-labor/PersonProfileEditForm';
import { AssignSkillDialog } from '@/components/people-labor/AssignSkillDialog';
import { AssignCraftDialog } from '@/components/people-labor/AssignCraftDialog';
import { AssignBusinessAreaDialog } from '@/components/people-labor/AssignBusinessAreaDialog';
import { PersonLocationAssignments } from '@/components/people-labor/PersonLocationAssignments';
import { usePersonLocations } from '@/hooks/usePersonLocations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Award,
  Users,
  User,
  DollarSign,
  AlertTriangle,
  UserCheck,
  FileText,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Star,
  BadgeCheck
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
  const { toast } = useToast();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [craftDialogOpen, setCraftDialogOpen] = useState(false);
  const [businessAreaDialogOpen, setBusinessAreaDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [editingCraft, setEditingCraft] = useState<any>(null);
  const [deletingSkill, setDeletingSkill] = useState<any>(null);
  const [deletingCraft, setDeletingCraft] = useState<any>(null);
  const [deletingBusinessArea, setDeletingBusinessArea] = useState<any>(null);
  
  
  // Fetch person data with optimized single query
  const { data: person, isLoading: personLoading } = usePerson(id);
  
  // Only import updatePerson for updates
  const { updatePerson } = usePeople();
  
  // Fetch related data
  const { personSkills, isLoading: skillsLoading, removeSkill } = usePersonSkills(id);
  const { personCrafts, isLoading: craftsLoading, removePersonCraft } = usePersonCrafts(id);
  const { data: personBusinessAreas, isLoading: businessAreasLoading } = usePersonBusinessAreas(id);
  const { data: personLocations = [] } = usePersonLocations(id);
  const { skills } = useSkills();
  const { crafts } = useCrafts();
  const { data: businessAreas } = useBusinessAreas();
  const removeBusinessArea = useRemoveBusinessArea();
  const setPrimaryBusinessArea = useSetPrimaryBusinessArea();
  
  // Get business area from person object (with type assertion for nested data)
  const businessArea = React.useMemo(() => (person as any)?.business_area, [person]);

  // Handler functions for skills and crafts
  const handleEditSkill = (skill: any) => {
    setEditingSkill(skill);
    setSkillDialogOpen(true);
  };

  const handleEditCraft = (craft: any) => {
    setEditingCraft(craft);
    setCraftDialogOpen(true);
  };

  const handleDeleteSkill = async () => {
    if (deletingSkill) {
      await removeSkill.mutateAsync(deletingSkill.id);
      setDeletingSkill(null);
    }
  };

  const handleDeleteCraft = async () => {
    if (deletingCraft) {
      await removePersonCraft.mutateAsync(deletingCraft.id);
      setDeletingCraft(null);
    }
  };

  const handleDeleteBusinessArea = async () => {
    if (deletingBusinessArea && id) {
      await removeBusinessArea.mutateAsync({ 
        id: deletingBusinessArea.id, 
        person_id: id 
      });
      setDeletingBusinessArea(null);
    }
  };

  const handleSetPrimaryBusinessArea = async (businessAreaId: string) => {
    if (id) {
      await setPrimaryBusinessArea.mutateAsync({ 
        id: businessAreaId, 
        person_id: id 
      });
    }
  };

  const handleSkillDialogClose = (open: boolean) => {
    setSkillDialogOpen(open);
    if (!open) setEditingSkill(null);
  };

  const handleCraftDialogClose = (open: boolean) => {
    setCraftDialogOpen(open);
    if (!open) setEditingCraft(null);
  };

  // Handle save profile
  const handleSaveProfile = async (data: Partial<Person>) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updatePerson.mutateAsync({ id, ...data });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (personLoading || skillsLoading || craftsLoading) {
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

  const getProficiencyValue = (level: string) => {
    const values = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100
    };
    return values[level as keyof typeof values] || 0;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

      {/* Enhanced Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/people-labor/people')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to People
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Enhanced Avatar */}
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                {getInitials(person.first_name, person.last_name)}
              </AvatarFallback>
            </Avatar>

            {/* Header Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold text-foreground">
                  {person.first_name} {person.last_name}
                </h1>
                <Badge className={`${getStatusColor(person.employment_status)} animate-pulse`}>
                  {person.employment_status}
                </Badge>
                {person.user_id && (
                  <Badge variant="outline" className="border-primary text-primary">
                    <UserCheck className="w-3 h-3 mr-1" />
                    System Access
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  #{person.employee_number}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {person.job_title || 'N/A'}
                </span>
                {person.department && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {person.department}
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{personSkills.length} Skills</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border">
                  <Wrench className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{personCrafts.length} Crafts</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => setIsEditing(!isEditing)} 
              variant={isEditing ? "outline" : "default"}
              className="shrink-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Card with Better Layout */}
      <Card className="border-border shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>
            {isEditing ? "Edit basic employment and contact information" : "Complete employment and contact information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <PersonProfileEditForm
              person={person as any}
              businessAreas={[]}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Contact Information Section */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Contact Information
                </h3>
                <Separator />
                
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-foreground">{person.email || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-foreground">{person.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Areas</label>
                    <div className="mt-1.5 space-y-2">
                      {personBusinessAreas && personBusinessAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {personBusinessAreas.map((ba) => (
                            <Badge 
                              key={ba.id} 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              {ba.business_area?.business_area || 'Unknown'}
                              {ba.is_primary && (
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No business areas assigned</p>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setBusinessAreaDialogOpen(true)}
                        className="mt-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Assign Business Area
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information Section */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Employment Details
                </h3>
                <Separator />
                
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-foreground font-medium">{person.job_title || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
                    <p className="text-sm text-foreground mt-1.5">{person.department || 'N/A'}</p>
                  </div>
                
                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hire Date</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-foreground">{formatDate(person.hire_date)}</span>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title</label>
                    <p className="text-sm text-foreground mt-1.5">{person.job_title || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Additional Notes
                </h3>
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {person.notes || 'No additional notes'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Tabs with Icons */}
      <Tabs defaultValue="notes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="notes" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2 py-3">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
            <Badge variant="secondary" className="ml-1 text-xs">{personSkills.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="craft" className="flex items-center gap-2 py-3">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Crafts</span>
            <Badge variant="secondary" className="ml-1 text-xs">{personCrafts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2 py-3">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Locations</span>
            {personLocations.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{personLocations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Notes & Additional Information
                  </CardTitle>
                  <CardDescription>Internal notes and remarks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {person.notes ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{person.notes}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No additional notes recorded</p>
                  <p className="text-xs text-muted-foreground mt-1">Edit profile to add notes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Skills Tab with Grid Layout */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skills & Proficiency
                  </CardTitle>
                  <CardDescription>Technical skills and competency levels</CardDescription>
                </div>
                <Button onClick={() => setSkillDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {skillsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : personSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personSkills.map((personSkill: any) => {
                    const skill = skills.find(s => s.id === personSkill.skill_id);
                    return (
                      <div key={personSkill.id} className="group relative border border-border rounded-xl p-5 bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all duration-200 hover:border-primary/50">
                        {/* Skill Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-lg mb-1">{skill?.skill_name || 'Unknown Skill'}</h4>
                            <p className="text-sm text-muted-foreground">{skill?.category}</p>
                          </div>
                          <div className="flex gap-2 items-start">
                            <Badge className={`${getProficiencyColor(personSkill.proficiency_level)} shrink-0`}>
                              {personSkill.proficiency_level}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditSkill(personSkill)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => setDeletingSkill(personSkill)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Proficiency Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Proficiency</span>
                            <span className="text-xs font-medium text-foreground">{getProficiencyValue(personSkill.proficiency_level)}%</span>
                          </div>
                          <Progress value={getProficiencyValue(personSkill.proficiency_level)} className="h-2" />
                        </div>

                        <Separator className="my-3" />

                        {/* Skill Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Experience</span>
                            <p className="text-foreground font-medium">{personSkill.years_experience || 0} years</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Certified</span>
                            <p className="text-foreground font-medium">
                              {personSkill.certified ? (
                                <Badge variant="outline" className="border-success text-success">
                                  <BadgeCheck className="w-3 h-3 mr-1" />
                                  Yes
                                </Badge>
                              ) : (
                                'No'
                              )}
                            </p>
                          </div>
                          {personSkill.certification_date && (
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Cert. Date</span>
                              <p className="text-foreground font-medium">{formatDate(personSkill.certification_date)}</p>
                            </div>
                          )}
                          {personSkill.certification_expiry && (
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Expiry</span>
                              <p className="text-foreground font-medium">{formatDate(personSkill.certification_expiry)}</p>
                            </div>
                          )}
                        </div>

                        {personSkill.notes && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-sm text-muted-foreground italic">{personSkill.notes}</p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">No skills assigned yet</p>
                  <p className="text-muted-foreground text-sm mt-1">Skills will appear here once assigned to this person</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Craft Tab with Grid Layout */}
        <TabsContent value="craft" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-accent" />
                    Craft Assignments
                  </CardTitle>
                  <CardDescription>Specialized craft skills and certifications</CardDescription>
                </div>
                <Button onClick={() => setCraftDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Craft
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {craftsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : personCrafts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personCrafts.map((assignment) => (
                    <div key={assignment.id} className="group relative border border-border rounded-xl p-5 bg-gradient-to-br from-card to-accent/5 hover:shadow-md transition-all duration-200 hover:border-accent/50">
                      {/* Craft Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-lg mb-1">{assignment.crafts?.name}</h4>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="flex flex-col gap-2">
                            <Badge className={`${getProficiencyColor(assignment.proficiency_level)} shrink-0`}>
                              {assignment.proficiency_level}
                            </Badge>
                            <Badge variant="outline" className="shrink-0">
                              {assignment.certification_status}
                            </Badge>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditCraft(assignment)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => setDeletingCraft(assignment)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Proficiency Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Proficiency</span>
                          <span className="text-xs font-medium text-foreground">{getProficiencyValue(assignment.proficiency_level)}%</span>
                        </div>
                        <Progress value={getProficiencyValue(assignment.proficiency_level)} className="h-2" />
                      </div>

                      <Separator className="my-3" />

                      {/* Assignment Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Assigned Date</span>
                          <p className="text-foreground font-medium">{formatDate(assignment.assigned_date || undefined)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                          <p className="text-foreground font-medium">
                            <Badge variant={assignment.certification_status === 'certified' ? 'default' : 'secondary'} className="text-xs">
                              {assignment.certification_status === 'certified' && <BadgeCheck className="w-3 h-3 mr-1" />}
                              {assignment.certification_status}
                            </Badge>
                          </p>
                        </div>
                      </div>

                      {assignment.notes && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm text-muted-foreground italic">{assignment.notes}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">No craft assignments yet</p>
                  <p className="text-muted-foreground text-sm mt-1">Craft assignments will appear here once assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assigned Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <PersonLocationAssignments personId={id!} />
        </TabsContent>
      </Tabs>

      {/* Skill Assignment Dialog */}
      <AssignSkillDialog
        open={skillDialogOpen}
        onOpenChange={handleSkillDialogClose}
        personId={id!}
        editingSkill={editingSkill}
      />

      {/* Craft Assignment Dialog */}
      <AssignCraftDialog
        open={craftDialogOpen}
        onOpenChange={handleCraftDialogClose}
        personId={id!}
        editingCraft={editingCraft}
      />

      {/* Business Area Assignment Dialog */}
      <AssignBusinessAreaDialog
        open={businessAreaDialogOpen}
        onOpenChange={setBusinessAreaDialogOpen}
        personId={id!}
        existingAssignments={personBusinessAreas || []}
      />

      {/* Delete Skill Confirmation */}
      <AlertDialog open={!!deletingSkill} onOpenChange={() => setDeletingSkill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Skill?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this skill assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSkill}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Craft Confirmation */}
      <AlertDialog open={!!deletingCraft} onOpenChange={() => setDeletingCraft(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Craft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this craft assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCraft}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Business Area Confirmation */}
      <AlertDialog open={!!deletingBusinessArea} onOpenChange={() => setDeletingBusinessArea(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Business Area?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this business area assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBusinessArea}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonDetailPage;
