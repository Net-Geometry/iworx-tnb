import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowLeft } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";

interface PermissionModule {
  name: string;
  label: string;
  actions: { name: string; label: string }[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    name: "assets",
    label: "Asset Management",
    actions: [
      { name: "view", label: "View Assets" },
      { name: "create", label: "Create Assets" },
      { name: "edit", label: "Edit Assets" },
      { name: "delete", label: "Delete Assets" },
    ],
  },
  {
    name: "work_orders",
    label: "Work Orders",
    actions: [
      { name: "view", label: "View Work Orders" },
      { name: "create", label: "Create Work Orders" },
      { name: "edit", label: "Edit Work Orders" },
      { name: "delete", label: "Delete Work Orders" },
      { name: "assign", label: "Assign Work Orders" },
    ],
  },
  {
    name: "inventory",
    label: "Inventory",
    actions: [
      { name: "view", label: "View Inventory" },
      { name: "create", label: "Create Items" },
      { name: "edit", label: "Edit Items" },
      { name: "delete", label: "Delete Items" },
    ],
  },
  {
    name: "safety",
    label: "Safety",
    actions: [
      { name: "view", label: "View Safety Records" },
      { name: "create", label: "Create Safety Records" },
      { name: "edit", label: "Edit Safety Records" },
      { name: "delete", label: "Delete Safety Records" },
    ],
  },
  {
    name: "admin_panel",
    label: "Administration",
    actions: [
      { name: "access", label: "Access Admin Panel" },
      { name: "user_management", label: "Manage Users" },
      { name: "system_settings", label: "System Settings" },
      { name: "role_management", label: "Manage Roles" },
    ],
  },
];

export default function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles, createRole, updateRole } = useRoles();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    is_active: true,
    permissions: {} as Record<string, Record<string, boolean>>,
  });

  useEffect(() => {
    if (id && roles) {
      const role = roles.find((r) => r.id === id);
      if (role) {
        setFormData({
          name: role.name,
          display_name: role.display_name,
          description: role.description || "",
          is_active: role.is_active,
          permissions: role.permissions,
        });
      }
    }
  }, [id, roles]);

  const handlePermissionToggle = (module: string, action: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: checked,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await updateRole.mutateAsync({ id, ...formData });
      } else {
        await createRole.mutateAsync(formData);
      }
      navigate("/admin/roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/roles")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{id ? "Edit Role" : "Create New Role"}</h1>
          <p className="text-muted-foreground">
            {id ? "Update role details and permissions" : "Define a new role with specific permissions"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Define the role name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role ID *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., technician"
                required
                disabled={!!id}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (lowercase, no spaces). Cannot be changed after creation.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g., Maintenance Technician"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this role's responsibilities"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Status</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Configure what this role can access and do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {PERMISSION_MODULES.map((module) => (
              <div key={module.name} className="space-y-3">
                <h3 className="font-semibold text-sm">{module.label}</h3>
                <div className="grid gap-3 pl-4">
                  {module.actions.map((action) => (
                    <div key={action.name} className="flex items-center justify-between">
                      <Label htmlFor={`${module.name}-${action.name}`} className="font-normal">
                        {action.label}
                      </Label>
                      <Switch
                        id={`${module.name}-${action.name}`}
                        checked={formData.permissions[module.name]?.[action.name] || false}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(module.name, action.name, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/roles")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : id ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}
