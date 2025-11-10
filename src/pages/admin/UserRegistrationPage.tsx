import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, Lock, User, Building2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/useRoles";
import { useOrganizations } from "@/hooks/useOrganizations";

export default function UserRegistrationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { organizations } = useOrganizations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    roleIds: [] as string[], // Changed to support multiple roles
    employeeNumber: "",
    organizationIds: [] as string[]
  });

  // Auto-select MSMS by default
  useEffect(() => {
    const msms = organizations.find(org => org.code === 'MSMS');
    if (msms && formData.organizationIds.length === 0) {
      setFormData(prev => ({
        ...prev,
        organizationIds: [msms.id]
      }));
    }
  }, [organizations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate organization selection
      if (formData.organizationIds.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least one organization."
        });
        setLoading(false);
        return;
      }

      // Validate role selection
      if (formData.roleIds.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least one role."
        });
        setLoading(false);
        return;
      }

      // Create user via edge function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          roleIds: formData.roleIds, // Changed to array
          organizationIds: formData.organizationIds
        }
      });

      if (edgeError) throw edgeError;

      if (edgeData?.userId) {

        // Create corresponding people record in primary organization
        if (formData.employeeNumber) {
          const { error: personError } = await supabase.rpc('import_user_as_person', {
            _user_id: edgeData.userId,
            _employee_number: formData.employeeNumber,
            _organization_id: formData.organizationIds[0]
          });

          if (personError) {
            console.error("Error creating person record:", personError);
            toast({
              variant: "destructive",
              title: "Warning",
              description: "User created but employee record failed. You can link them manually from People Management."
            });
          }
        }

        toast({
          title: "User Created",
          description: `${formData.email} has been registered successfully with system access and employee record.`
        });

        // Reset form (but keep MSMS selected)
        const msms = organizations.find(org => org.code === 'MSMS');
        setFormData({
          email: "",
          password: "",
          displayName: "",
          roleIds: [],
          employeeNumber: "",
          organizationIds: msms ? [msms.id] : []
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to register user. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <UserPlus className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">User Registration</h1>
          <p className="text-muted-foreground">Register new users in the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New User & Employee</CardTitle>
          <CardDescription>
            Creates both a system user account and an employee record. For employees without system access, use the People Management page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  className="pl-9"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-9"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Employee Number *</Label>
              <Input
                id="employeeNumber"
                type="text"
                placeholder="EMP001"
                required
                value={formData.employeeNumber}
                onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This will be used to create the employee record
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label>User Roles *</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {roles.filter(role => role.is_active).map((role) => (
                      <div key={role.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.roleIds.includes(role.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                roleIds: [...formData.roleIds, role.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                roleIds: formData.roleIds.filter(id => id !== role.id)
                              });
                            }
                          }}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm cursor-pointer font-medium"
                          >
                            {role.display_name}
                          </label>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">
                Select one or more roles. User will have combined permissions from all selected roles.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Assign to Verticals *</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {organizations.filter(org => org.is_active).map((org) => (
                      <div key={org.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`org-${org.id}`}
                          checked={formData.organizationIds.includes(org.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                organizationIds: [...formData.organizationIds, org.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                organizationIds: formData.organizationIds.filter(id => id !== org.id)
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`org-${org.id}`}
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{org.name}</span>
                          <span className="text-muted-foreground">({org.code})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">
                User will have access to selected verticals. At least one required.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const msms = organizations.find(org => org.code === 'MSMS');
                  setFormData({
                    email: "",
                    password: "",
                    displayName: "",
                    roleIds: [],
                    employeeNumber: "",
                    organizationIds: msms ? [msms.id] : []
                  });
                }}
              >
                Clear
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• This page creates both a system user account AND an employee record automatically</p>
          <p>• For employees who don't need system access, use the <strong>People Management</strong> page instead</p>
          <p>• Users will need to confirm their email address before they can log in (if email confirmation is enabled in settings)</p>
          <p>• You can manage existing users and their roles from the User Management page</p>
        </CardContent>
      </Card>
    </div>
  );
}
