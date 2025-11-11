import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  hazard_number: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  category: z.enum(['physical', 'chemical', 'biological', 'ergonomic', 'psychosocial']),
  likelihood: z.coerce.number().min(1).max(5),
  severity: z.coerce.number().min(1).max(5),
  mitigation_measures: z.string().optional(),
  responsible_person: z.string().optional(),
  review_date: z.date().optional(),
  status: z.enum(['open', 'mitigated', 'closed']),
});

type FormData = z.infer<typeof formSchema>;

interface HazardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  hazard?: any;
  mode: 'create' | 'edit';
}

const categories = [
  { value: 'physical', label: 'Physical (slips, falls, machinery)' },
  { value: 'chemical', label: 'Chemical (toxins, fumes)' },
  { value: 'biological', label: 'Biological (bacteria, viruses)' },
  { value: 'ergonomic', label: 'Ergonomic (repetitive strain)' },
  { value: 'psychosocial', label: 'Psychosocial (stress, violence)' },
];

const likelihoodLevels = [
  { value: 1, label: 'Rare (1)', description: 'May occur only in exceptional circumstances' },
  { value: 2, label: 'Unlikely (2)', description: 'Could occur at some time' },
  { value: 3, label: 'Possible (3)', description: 'Might occur at some time' },
  { value: 4, label: 'Likely (4)', description: 'Will probably occur in most circumstances' },
  { value: 5, label: 'Almost Certain (5)', description: 'Expected to occur in most circumstances' },
];

const severityLevels = [
  { value: 1, label: 'Insignificant (1)', description: 'No injuries, minimal impact' },
  { value: 2, label: 'Minor (2)', description: 'First aid treatment, minor impact' },
  { value: 3, label: 'Moderate (3)', description: 'Medical treatment required' },
  { value: 4, label: 'Major (4)', description: 'Extensive injuries, major impact' },
  { value: 5, label: 'Catastrophic (5)', description: 'Death or permanent disability' },
];

const getRiskLevel = (score: number): { level: string; color: string } => {
  if (score >= 21) return { level: 'Very High', color: 'bg-destructive text-destructive-foreground' };
  if (score >= 16) return { level: 'High', color: 'bg-warning text-warning-foreground' };
  if (score >= 9) return { level: 'Medium', color: 'bg-accent text-accent-foreground' };
  if (score >= 5) return { level: 'Low', color: 'bg-accent-success text-white' };
  return { level: 'Very Low', color: 'bg-primary text-primary-foreground' };
};

export function HazardForm({ open, onOpenChange, onSubmit, hazard, mode }: HazardFormProps) {
  const [likelihood, setLikelihood] = useState<number>(hazard?.likelihood || 3);
  const [severity, setSeverity] = useState<number>(hazard?.severity || 3);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hazard_number: hazard?.hazard_number || "",
      title: hazard?.title || "",
      description: hazard?.description || "",
      location: hazard?.location || "",
      category: hazard?.category || 'physical',
      likelihood: hazard?.likelihood || 3,
      severity: hazard?.severity || 3,
      mitigation_measures: hazard?.mitigation_measures || "",
      responsible_person: hazard?.responsible_person || "",
      review_date: hazard?.review_date ? new Date(hazard.review_date) : undefined,
      status: hazard?.status || 'open',
    },
  });

  // Update likelihood and severity when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.likelihood) setLikelihood(Number(value.likelihood));
      if (value.severity) setSeverity(Number(value.severity));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const riskScore = likelihood * severity;
  const riskInfo = getRiskLevel(riskScore);

  const handleSubmit = async (data: FormData) => {
    const submissionData = {
      ...data,
      review_date: data.review_date ? data.review_date.toISOString().split('T')[0] : null,
    };
    
    await onSubmit(submissionData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Hazard' : 'Edit Hazard'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Hazard Number and Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hazard_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hazard Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-generated if empty" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Leave empty for auto-generation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="mitigated">Mitigated</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the hazard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the hazard and its potential consequences"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location and Category */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Where is this hazard located?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Risk Assessment */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-gradient-card">
              <h3 className="font-semibold text-sm">Risk Assessment</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select likelihood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {likelihoodLevels.map(level => (
                            <SelectItem key={level.value} value={String(level.value)}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-muted-foreground">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {severityLevels.map(level => (
                            <SelectItem key={level.value} value={String(level.value)}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-muted-foreground">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Risk Score Display */}
              <div className="flex items-center justify-between p-3 bg-background rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold">{riskScore}</p>
                  <p className="text-xs text-muted-foreground">Likelihood × Severity = {likelihood} × {severity}</p>
                </div>
                <Badge className={cn("text-sm px-3 py-1", riskInfo.color)}>
                  {riskInfo.level}
                </Badge>
              </div>
            </div>

            {/* Mitigation Measures */}
            <FormField
              control={form.control}
              name="mitigation_measures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mitigation Measures</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe measures taken or planned to mitigate this hazard"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Responsible Person and Review Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsible Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Who is responsible for mitigation?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="review_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Review Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Create Hazard' : 'Update Hazard'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
