import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/useRoles";

export default function UserRegistrationPage() {
  const { toast } = useToast();
  const { roles, isLoading: rolesLoading } = useRoles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    roleId: "",
    employeeNumber: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          display_name: formData.displayName
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: formData.roleId
          });

        if (roleError) throw roleError;

        // Create corresponding people record
        if (formData.employeeNumber) {
          const { error: personError } = await supabase.rpc('import_user_as_person', {
            _user_id: authData.user.id,
            _employee_number: formData.employeeNumber
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

        // Reset form
        setFormData({
          email: "",
          password: "",
          displayName: "",
          roleId: "",
          employeeNumber: ""
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
              <Label htmlFor="role">User Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                disabled={rolesLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {roles.filter(role => role.is_active).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div>
                        <div className="font-medium">{role.display_name}</div>
                        {role.description && (
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the role that defines this user's permissions
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ email: "", password: "", displayName: "", roleId: "", employeeNumber: "" })}
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
