import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAssets } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { useHierarchyNodes, useHierarchyLevels } from "@/hooks/useHierarchyData";

// Form validation schema
const incidentSchema = z.object({
  incident_date: z.string().min(1, "Incident date is required"),
  location: z.string().min(1, "Location is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  asset_id: z.string().optional(),
  reporter_name: z.string().min(1, "Reporter name is required"),
  reporter_email: z.string().email("Invalid email").optional().or(z.literal("")),
  immediate_actions: z.string().optional(),
  regulatory_reporting_required: z.boolean().default(false),
  create_work_order: z.boolean().default(false),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

interface IncidentReportFormProps {
  onSubmit: (data: IncidentFormValues) => void;
  onCancel: () => void;
}

export const IncidentReportForm = ({ onSubmit, onCancel }: IncidentReportFormProps) => {
  const { assets } = useAssets();
  const { user } = useAuth();
  const { levels } = useHierarchyLevels();
  const { nodes } = useHierarchyNodes();

  // Filter for location nodes (level_order = 4)
  const locationLevel = levels.find(level => level.level_order === 4);
  const flattenNodes = (nodeArray: any[]): any[] => {
    return nodeArray.reduce((acc, node) => {
      acc.push(node);
      if (node.children && node.children.length > 0) {
        acc.push(...flattenNodes(node.children));
      }
      if (node.assets && node.assets.length > 0) {
        acc.push(...node.assets);
      }
      return acc;
    }, []);
  };
  const allNodes = flattenNodes(nodes);
  const locationNodes = allNodes.filter(node => 
    node.hierarchy_level_id === locationLevel?.id
  );

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: new Date().toISOString().split('T')[0],
      severity: "medium",
      reporter_name: user?.user_metadata?.display_name || "",
      reporter_email: user?.email || "",
      regulatory_reporting_required: false,
      create_work_order: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incident Date & Time */}
          <FormField
            control={form.control}
            name="incident_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Date & Time *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Severity */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor injury, no lost time</SelectItem>
                    <SelectItem value="medium">Medium - Medical treatment required</SelectItem>
                    <SelectItem value="high">High - Lost time injury</SelectItem>
                    <SelectItem value="critical">Critical - Severe injury or fatality</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location from asset hierarchy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locationNodes.map((node) => (
                    <SelectItem key={node.id} value={node.name}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Asset Involved */}
        <FormField
          control={form.control}
          name="asset_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Involved (if applicable)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No asset involved</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} - {asset.asset_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Title *</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the incident" {...field} />
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
              <FormLabel>Detailed Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of what happened, who was involved, and any witnesses..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Immediate Actions Taken */}
        <FormField
          control={form.control}
          name="immediate_actions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Immediate Actions Taken</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe any immediate actions taken to secure the scene, provide first aid, or prevent further incidents..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reporter Name */}
          <FormField
            control={form.control}
            name="reporter_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporter Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reporter Email */}
          <FormField
            control={form.control}
            name="reporter_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporter Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="regulatory_reporting_required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Regulatory Reporting Required
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Check if this incident requires reporting to regulatory authorities
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="create_work_order"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Create Work Order
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Automatically create a corrective maintenance work order for this incident
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Submit Incident Report</Button>
        </div>
      </form>
    </Form>
  );
};
