import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { usePeople } from "@/hooks/usePeople";
import { useRoles } from "@/hooks/useRoles";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";

const personSchema = z.object({
  employee_number: z.string().min(1, "Employee number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  hire_date: z.string().optional(),
  employment_status: z.enum(["active", "inactive", "on_leave", "terminated"]),
  job_title: z.string().optional(),
  department: z.string().optional(),
  hourly_rate: z.string().optional(),
  notes: z.string().optional(),
  createSystemAccount: z.boolean().default(false),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  roleId: z.string().optional(),
}).refine((data) => {
  if (data.createSystemAccount) {
    return data.password && data.password.length >= 6;
  }
  return true;
}, {
  message: "Password must be at least 6 characters when creating system account",
  path: ["password"],
}).refine((data) => {
  if (data.createSystemAccount) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords must match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.createSystemAccount) {
    return data.email && data.email.length > 0;
  }
  return true;
}, {
  message: "Email is required when creating system account",
  path: ["email"],
}).refine((data) => {
  if (data.createSystemAccount) {
    return data.roleId && data.roleId.length > 0;
  }
  return true;
}, {
  message: "Role is required when creating system account",
  path: ["roleId"],
});

type PersonFormData = z.infer<typeof personSchema>;

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPersonDialog({ open, onOpenChange }: AddPersonDialogProps) {
  const { createPerson } = usePeople();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { assignRole } = useUserRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      employment_status: "active",
      createSystemAccount: false,
    },
  });

  const employmentStatus = watch("employment_status");
  const createSystemAccount = watch("createSystemAccount");

  const onSubmit = async (data: PersonFormData) => {
    setIsSubmitting(true);
    try {
      let userId: string | undefined = undefined;

      // Step 1: Create system account if requested
      if (data.createSystemAccount && data.email && data.password && data.roleId) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            display_name: `${data.first_name} ${data.last_name}`
          }
        });

        if (authError) throw authError;
        userId = authData.user?.id;

        // Assign role
        if (userId) {
          await assignRole.mutateAsync({
            userId: userId,
            roleId: data.roleId
          });
        }
      }

      // Step 2: Create person record
      await createPerson.mutateAsync({
        user_id: userId,
        employee_number: data.employee_number,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        job_title: data.job_title || undefined,
        department: data.department || undefined,
        hire_date: data.hire_date || undefined,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : undefined,
        employment_status: data.employment_status,
        notes: data.notes || undefined,
        is_active: true,
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating person:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_number">Employee Number *</Label>
              <Input
                id="employee_number"
                {...register("employee_number")}
                placeholder="EMP-001"
              />
              {errors.employee_number && (
                <p className="text-sm text-destructive">{errors.employee_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_status">Employment Status</Label>
              <Select
                value={employmentStatus}
                onValueChange={(value) =>
                  setValue("employment_status", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input id="job_title" {...register("job_title")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...register("department")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input id="hire_date" type="date" {...register("hire_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                {...register("hourly_rate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} />
          </div>

          <Separator className="my-6" />

          {/* System Account Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createSystemAccount"
                checked={createSystemAccount}
                onCheckedChange={(checked) => setValue("createSystemAccount", checked as boolean)}
              />
              <Label htmlFor="createSystemAccount" className="font-semibold cursor-pointer">
                Create System Account (Optional)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Enable this to give the employee access to log into the system
            </p>

            {createSystemAccount && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleId">System Role *</Label>
                  <Select
                    value={watch("roleId")}
                    onValueChange={(value) => setValue("roleId", value)}
                    disabled={rolesLoading}
                  >
                    <SelectTrigger id="roleId">
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
                  {errors.roleId && (
                    <p className="text-sm text-destructive">{errors.roleId.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
