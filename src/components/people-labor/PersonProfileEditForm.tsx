import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Briefcase, Calendar, DollarSign, User, Save, X } from 'lucide-react';
import { Person } from '@/hooks/usePeople';
import { BusinessArea } from '@/hooks/useBusinessAreas';

/**
 * Schema for editing basic person information (Profile Overview only)
 */
const profileSchema = z.object({
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
  business_area_id: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface PersonProfileEditFormProps {
  person: Person;
  businessAreas: BusinessArea[];
  onSave: (data: Partial<Person>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

/**
 * Inline editable form for person profile overview
 */
export const PersonProfileEditForm: React.FC<PersonProfileEditFormProps> = ({
  person,
  businessAreas,
  onSave,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      employee_number: person.employee_number || '',
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      email: person.email || '',
      phone: person.phone || '',
      hire_date: person.hire_date || '',
      employment_status: person.employment_status || 'active',
      job_title: person.job_title || '',
      department: person.department || '',
      hourly_rate: person.hourly_rate?.toString() || '',
      business_area_id: person.business_area_id || '',
    },
  });

  const employmentStatus = watch("employment_status");
  const selectedBusinessArea = watch("business_area_id");

  const onSubmit = async (data: ProfileFormData) => {
    await onSave({
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
      business_area_id: data.business_area_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Contact Information Section */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Contact Information
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="pl-10"
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Phone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  {...register("phone")}
                  className="pl-10"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_area_id" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Business Area
              </Label>
              <Select
                value={selectedBusinessArea || undefined}
                onValueChange={(value) => setValue("business_area_id", value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business area" />
                </SelectTrigger>
                <SelectContent>
                  {businessAreas?.map((ba) => (
                    <SelectItem key={ba.id} value={ba.id}>
                      {ba.business_area} {ba.region && `- ${ba.region}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Employment Information Section */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Employment Details
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee_number" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Employee Number *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="employee_number"
                  {...register("employee_number")}
                  className="pl-10"
                  placeholder="EMP-001"
                />
              </div>
              {errors.employee_number && (
                <p className="text-xs text-destructive">{errors.employee_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                First Name *
              </Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Name *
              </Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Job Title
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="job_title"
                  {...register("job_title")}
                  className="pl-10"
                  placeholder="Technician"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Department
              </Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="Maintenance"
              />
            </div>
          </div>
        </div>

        {/* Financial & Status Section */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Status & Compensation
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employment_status" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Employment Status *
              </Label>
              <Select
                value={employmentStatus}
                onValueChange={(value) => setValue("employment_status", value as any)}
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

            <div className="space-y-2">
              <Label htmlFor="hire_date" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hire Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hire_date"
                  type="date"
                  {...register("hire_date")}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hourly Rate ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  {...register("hourly_rate")}
                  className="pl-10"
                  placeholder="25.00"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
