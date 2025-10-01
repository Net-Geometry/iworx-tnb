import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Save, UserCog } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * User Role Management Page
 * Allows admins to assign/remove multiple roles for a specific user
 */
export default function UserRolesPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { assignRole, removeRole } = useUserRoles();
  
  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentRoleIds, setCurrentRoleIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user data and their current roles
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .single();

        // Fetch auth user for email
        const { data: authData } = await supabase.auth.admin.getUserById(userId);

        // Fetch current roles
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", userId);

        if (authData?.user) {
          setUserEmail(authData.user.email || "");
        }

        if (profile) {
          setDisplayName(profile.display_name || "");
        }

        const roleIds = userRoles?.map((ur) => ur.role_id) || [];
        setCurrentRoleIds(roleIds);
        setSelectedRoleIds(roleIds);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, toast]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      // Determine roles to add and remove
      const rolesToAdd = selectedRoleIds.filter((id) => !currentRoleIds.includes(id));
      const rolesToRemove = currentRoleIds.filter((id) => !selectedRoleIds.includes(id));

      // Add new roles
      for (const roleId of rolesToAdd) {
        await assignRole.mutateAsync({ userId, roleId });
      }

      // Remove old roles
      for (const roleId of rolesToRemove) {
        await removeRole.mutateAsync({ userId, roleId });
      }

      setCurrentRoleIds(selectedRoleIds);

      toast({
        title: "Roles Updated",
        description: "User roles have been updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update roles",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  if (loading || rolesLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const hasChanges = 
    currentRoleIds.length !== selectedRoleIds.length ||
    currentRoleIds.some((id) => !selectedRoleIds.includes(id));

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/user-management")}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to User Management
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <UserCog className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manage User Roles</h1>
          <p className="text-muted-foreground">
            {displayName} ({userEmail})
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Assignments
          </CardTitle>
          <CardDescription>
            Select all roles that should be assigned to this user. Users can have multiple roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {roles
              .filter((role) => role.is_active)
              .map((role) => {
                const isSelected = selectedRoleIds.includes(role.id);
                return (
                  <div
                    key={role.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <span className="font-medium">{role.display_name}</span>
                        {role.is_system_role && (
                          <Badge variant="secondary" className="text-xs">
                            System Role
                          </Badge>
                        )}
                      </Label>
                      {role.description && (
                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedRoleIds.length} role(s) selected
              {hasChanges && <span className="text-primary ml-2">• Unsaved changes</span>}
            </div>
            <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
          <CardDescription>
            This user will have the combined permissions from all selected roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {selectedRoleIds.length === 0 ? (
              <p>No roles selected. User will have no system permissions.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium text-foreground">Active Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoleIds.map((roleId) => {
                    const role = roles.find((r) => r.id === roleId);
                    return role ? (
                      <Badge key={roleId} variant="secondary">
                        {role.display_name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
