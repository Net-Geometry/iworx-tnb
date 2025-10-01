import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePeople } from "@/hooks/usePeople";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessAreas } from "@/hooks/useBusinessAreas";
import { ArrowLeft, User, Briefcase, FileText, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Schema for editing person information
 */
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
  certifications: z.string().optional(),
  business_area_id: z.string().optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

/**
 * Edit Person Page - Standalone page for editing person details
 */
export default function EditPersonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePerson } = usePeople();
  const { data: businessAreas, isLoading: businessAreasLoading } = useBusinessAreas();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [person, setPerson] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      employment_status: "active",
    },
  });

  const employmentStatus = watch("employment_status");

  // Fetch person data
  useEffect(() => {
    const fetchPerson = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("people")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setPerson(data);
          // Populate form with existing data
          setValue("employee_number", data.employee_number || "");
          setValue("first_name", data.first_name || "");
          setValue("last_name", data.last_name || "");
          setValue("email", data.email || "");
          setValue("phone", data.phone || "");
          setValue("hire_date", data.hire_date || "");
          setValue("employment_status", data.employment_status || "active");
          setValue("job_title", data.job_title || "");
          setValue("department", data.department || "");
          setValue("hourly_rate", data.hourly_rate?.toString() || "");
          setValue("notes", data.notes || "");
          setValue("certifications", Array.isArray(data.certifications) ? data.certifications.join(", ") : (data.certifications || ""));
          setValue("business_area_id", data.business_area_id || "");
        }
      } catch (error: any) {
        console.error("Error fetching person:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load person details",
        });
        navigate("/people-labor/people");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [id, setValue, toast, navigate]);

  const onSubmit = async (data: PersonFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updatePerson.mutateAsync({
        id,
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
        certifications: data.certifications ? data.certifications.split(",").map(c => c.trim()).filter(c => c) : undefined,
        business_area_id: data.business_area_id || null,
      });

      toast({
        title: "Success",
        description: "Employee information updated successfully",
      });

      navigate(`/people-labor/people/${id}`);
    } catch (error: any) {
      console.error("Error updating person:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update employee information",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || businessAreasLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Person not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/people-labor/people/${id}`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Person Details
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Employee</h1>
          <p className="text-muted-foreground mt-1">
            Update employee information for {person.first_name} {person.last_name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
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
                <Label htmlFor="employment_status">Employment Status *</Label>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Contact & Work Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
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

            <div className="space-y-2">
              <Label htmlFor="business_area_id">Business Area (Optional)</Label>
              <Select
                value={watch("business_area_id") || undefined}
                onValueChange={(value) => setValue("business_area_id", value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business area (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {businessAreas?.map((ba) => (
                    <SelectItem key={ba.id} value={ba.id}>
                      {ba.business_area} {ba.region && `- ${ba.region}`} {ba.state && `(${ba.state})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                {...register("certifications")}
                placeholder="List any certifications..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes about this employee..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/people-labor/people/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
