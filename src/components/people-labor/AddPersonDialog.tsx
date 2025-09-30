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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePeople } from "@/hooks/usePeople";
import { useRoles } from "@/hooks/useRoles";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Briefcase, ShieldCheck, Lock, FileText, CheckCircle2, Circle, HelpCircle } from "lucide-react";

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
  const { toast } = useToast();
  const { currentOrganization } = useAuth();
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
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const email = watch("email");
  const roleId = watch("roleId");

  // Password requirements checklist
  const passwordRequirements = {
    length: password && password.length >= 6,
    match: password && confirmPassword && password === confirmPassword,
    email: email && email.length > 0,
    role: roleId && roleId.length > 0,
  };

  const onSubmit = async (data: PersonFormData) => {
    setIsSubmitting(true);
    try {
      let userId: string | undefined = undefined;

      // Step 1: Create system account if requested
      if (data.createSystemAccount && data.email && data.password && data.roleId) {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
          body: {
            email: data.email,
            password: data.password,
            displayName: `${data.first_name} ${data.last_name}`,
            roleId: data.roleId,
            organizationIds: currentOrganization?.id ? [currentOrganization.id] : undefined,
          }
        });

        if (edgeError) {
          // Parse the error message from the edge function
          const errorMessage = typeof edgeError === 'string' 
            ? edgeError 
            : (edgeError as any)?.message || 'Failed to create system account';
          
          // Check if it's a duplicate email error
          if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
            toast({
              variant: "destructive",
              title: "Email Already Registered",
              description: "This email is already registered in the system. Please use a different email or link to the existing user account.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Failed to Create System Account",
              description: errorMessage,
            });
          }
          return; // Stop execution
        }
        userId = edgeData?.userId;
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
    } catch (error: any) {
      console.error("Error creating person:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Employee",
        description: error?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          {/* Contact & Work Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Contact & Work Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email {createSystemAccount && <span className="text-destructive">*</span>}
                  </Label>
                  <Input id="email" type="email" {...register("email")} />
                  {createSystemAccount && !errors.email && (
                    <p className="text-xs text-muted-foreground">Required for system login</p>
                  )}
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} placeholder="(555) 123-4567" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input id="job_title" {...register("job_title")} placeholder="e.g., Technician" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" {...register("department")} placeholder="e.g., Maintenance" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="25.00"
                    {...register("hourly_rate")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Access Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                System Access
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Enable this to allow the employee to log into the system with their own credentials</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createSystemAccount"
                  checked={createSystemAccount}
                  onCheckedChange={(checked) => setValue("createSystemAccount", checked as boolean)}
                />
                <Label htmlFor="createSystemAccount" className="font-medium cursor-pointer">
                  Create System Account
                </Label>
              </div>

              {createSystemAccount && (
                <Alert className="border-primary/50 bg-primary/5">
                  <AlertDescription className="space-y-4">
                    {/* Password Requirements Checklist */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Requirements:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {passwordRequirements.length ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={passwordRequirements.length ? "text-green-600" : "text-muted-foreground"}>
                            At least 6 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordRequirements.match ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={passwordRequirements.match ? "text-green-600" : "text-muted-foreground"}>
                            Passwords match
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordRequirements.email ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={passwordRequirements.email ? "text-green-600" : "text-muted-foreground"}>
                            Email provided
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordRequirements.role ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={passwordRequirements.role ? "text-green-600" : "text-muted-foreground"}>
                            Role selected
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Password *
                        </Label>
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
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Confirm Password *
                        </Label>
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
                          value={roleId}
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
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  {...register("notes")} 
                  rows={3} 
                  placeholder="Any additional information about this employee..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
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
