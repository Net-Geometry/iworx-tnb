import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface BulkUser {
  email: string;
  displayName: string;
  roleId: string;
  roleName: string;
  status: "pending" | "success" | "error";
  message?: string;
}

/**
 * Bulk User Creation Page
 * Allows admins to create multiple predefined users at once
 */
export default function BulkUserCreationPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<BulkUser[]>([
    {
      email: "manager1@iworx.com",
      displayName: "John Manager",
      roleId: "8f215157-5613-4bfc-ad15-d3952d35008f",
      roleName: "Manager",
      status: "pending",
    },
    {
      email: "manager2@iworx.com",
      displayName: "Sarah Manager",
      roleId: "8f215157-5613-4bfc-ad15-d3952d35008f",
      roleName: "Manager",
      status: "pending",
    },
    {
      email: "tech1@iworx.com",
      displayName: "Mike Technician",
      roleId: "a9ef6f0e-6bd4-48e8-8230-300bdd889203",
      roleName: "Technician",
      status: "pending",
    },
    {
      email: "tech2@iworx.com",
      displayName: "Lisa Technician",
      roleId: "a9ef6f0e-6bd4-48e8-8230-300bdd889203",
      roleName: "Technician",
      status: "pending",
    },
    {
      email: "engineer1@iworx.com",
      displayName: "David Engineer",
      roleId: "391268c3-25bb-41c9-9fe7-2356b3c02fdb",
      roleName: "Engineer",
      status: "pending",
    },
    {
      email: "engineer2@iworx.com",
      displayName: "Emma Engineer",
      roleId: "391268c3-25bb-41c9-9fe7-2356b3c02fdb",
      roleName: "Engineer",
      status: "pending",
    },
    {
      email: "planner1@iworx.com",
      displayName: "Tom Planner",
      roleId: "3f3bc2c5-4d2f-4733-917c-9a4446e48905",
      roleName: "Planner",
      status: "pending",
    },
    {
      email: "viewer1@iworx.com",
      displayName: "Alice Viewer",
      roleId: "fbac60ab-bfcc-453f-bdd9-d9af5446769b",
      roleName: "Viewer",
      status: "pending",
    },
  ]);

  const createAllUsers = async () => {
    setIsCreating(true);
    const password = "@Bcd1234";
    const organizationId = "d2b00bd4-7266-4942-b4c8-a5cfcb448daf"; // MSMS

    // Get the current session token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to create users.",
      });
      setIsCreating(false);
      return;
    }

    // Create users sequentially to track progress
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        const { data, error } = await supabase.functions.invoke("create-user", {
          body: {
            email: user.email,
            password: password,
            displayName: user.displayName,
            roleIds: [user.roleId],
            organizationIds: [organizationId],
          },
        });

        if (error) throw error;

        // Update user status to success
        setUsers((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: "success", message: "Created successfully" }
              : u
          )
        );
      } catch (error: any) {
        console.error(`Error creating ${user.email}:`, error);
        // Update user status to error
        setUsers((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? {
                  ...u,
                  status: "error",
                  message: error.message || "Failed to create",
                }
              : u
          )
        );
      }
    }

    setIsCreating(false);

    // Show completion toast
    const successCount = users.filter((u) => u.status === "success").length;
    const errorCount = users.filter((u) => u.status === "error").length;

    toast({
      title: "Bulk User Creation Complete",
      description: `${successCount} users created successfully. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });
  };

  const resetStatus = () => {
    setUsers((prev) =>
      prev.map((u) => ({ ...u, status: "pending" as const, message: undefined }))
    );
  };

  const getStatusIcon = (status: BulkUser["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/user-registration")}
            className="mb-4"
          >
            ← Back to User Registration
          </Button>
          <h1 className="text-3xl font-bold">Bulk User Creation</h1>
          <p className="text-muted-foreground">
            Create 8 predefined test users with assigned roles
          </p>
        </div>

        {/* User List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Users to Create</CardTitle>
            <CardDescription>
              All users will be created with password: <strong>@Bcd1234</strong>
              <br />
              All users will be assigned to: <strong>MSMS Organization</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User List */}
            <div className="space-y-3">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(user.status)}
                    <div className="flex-1">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.roleName}</p>
                      {user.message && (
                        <p className="text-xs text-muted-foreground">
                          {user.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={createAllUsers}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Users...
                  </>
                ) : (
                  "Create All Users"
                )}
              </Button>
              <Button
                onClick={resetStatus}
                variant="outline"
                disabled={isCreating}
              >
                Reset Status
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Important Notes:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>All users will be created with the same password: @Bcd1234</li>
                <li>Users will be assigned to MSMS organization by default</li>
                <li>Each user will have their designated role assigned</li>
                <li>User creation happens sequentially to track progress</li>
                <li>You must be logged in as an admin to create users</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
