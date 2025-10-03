import { useState } from "react";
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
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Wrench } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { useHierarchyNodes, useHierarchyLevels } from "@/hooks/useHierarchyData";
import { MultiFileUpload } from "@/components/incidents/MultiFileUpload";
import { useEffect } from "react";

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
  attachments: z.array(z.object({
    url: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  // Work Order Planning Fields
  requires_work_order: z.boolean().default(false),
  wo_maintenance_type: z.enum(["preventive", "corrective", "predictive", "emergency"]).optional(),
  wo_priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  wo_estimated_duration_hours: z.coerce.number().optional(),
  wo_assigned_technician: z.string().optional(),
  wo_estimated_cost: z.coerce.number().optional(),
  wo_target_start_date: z.string().optional(),
  wo_target_finish_date: z.string().optional(),
  wo_notes: z.string().optional(),
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

  // State to track selected location node ID for asset filtering
  const [selectedLocationNodeId, setSelectedLocationNodeId] = useState<string | undefined>();

  // Filter assets based on selected location
  const filteredAssets = selectedLocationNodeId
    ? assets.filter(asset => asset.hierarchy_node_id === selectedLocationNodeId)
    : assets;

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: new Date().toISOString().split('T')[0],
      severity: "medium",
      reporter_name: user?.user_metadata?.display_name || "",
      reporter_email: user?.email || "",
      regulatory_reporting_required: false,
      requires_work_order: false,
      attachments: [],
    },
  });

  // Auto-populate work order fields based on severity
  useEffect(() => {
    const severity = form.watch("severity");
    const requiresWorkOrder = form.watch("requires_work_order");
    
    if (requiresWorkOrder && severity) {
      // Auto-set priority to match severity
      if (!form.watch("wo_priority")) {
        form.setValue("wo_priority", severity);
      }
      
      // Auto-suggest maintenance type based on severity
      if (!form.watch("wo_maintenance_type")) {
        const maintenanceType = severity === "critical" || severity === "high" 
          ? "emergency" 
          : "corrective";
        form.setValue("wo_maintenance_type", maintenanceType);
      }
    }
  }, [form.watch("severity"), form.watch("requires_work_order")]);

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
              <Select 
                onValueChange={(value) => {
                  const selectedNode = locationNodes.find(node => node.name === value);
                  field.onChange(value); // Store name for form
                  setSelectedLocationNodeId(selectedNode?.id); // Store ID for filtering
                  form.setValue('asset_id', undefined); // Clear asset selection when location changes
                }} 
                value={field.value}
              >
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
                  {filteredAssets.map((asset) => (
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

        {/* Evidence & Attachments */}
        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evidence & Attachments (Optional)</FormLabel>
              <FormControl>
                <MultiFileUpload
                  onFilesChange={(files) => field.onChange(files)}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Upload photos of the incident scene, injuries, equipment damage, or supporting documents
              </p>
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

        {/* Regulatory Reporting */}
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

        {/* Work Order Planning Section - Collapsible */}
        <div className="border rounded-lg p-4 bg-muted/30 mt-6">
          <FormField
            control={form.control}
            name="requires_work_order"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    This incident requires maintenance work
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Check this to provide work order details for faster resolution
                  </p>
                </div>
              </FormItem>
            )}
          />

          <Collapsible open={form.watch("requires_work_order")} className="mt-4">
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Maintenance Type */}
                <FormField
                  control={form.control}
                  name="wo_maintenance_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="corrective">Corrective - Fix the issue</SelectItem>
                          <SelectItem value="preventive">Preventive - Prevent recurrence</SelectItem>
                          <SelectItem value="predictive">Predictive - Based on monitoring</SelectItem>
                          <SelectItem value="emergency">Emergency - Urgent action needed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Order Priority */}
                <FormField
                  control={form.control}
                  name="wo_priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Start Date */}
                <FormField
                  control={form.control}
                  name="wo_target_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estimated Duration */}
                <FormField
                  control={form.control}
                  name="wo_estimated_duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assigned Technician */}
                <FormField
                  control={form.control}
                  name="wo_assigned_technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suggested Technician</FormLabel>
                      <FormControl>
                        <Input placeholder="Technician name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estimated Cost */}
                <FormField
                  control={form.control}
                  name="wo_estimated_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Work Order Notes */}
              <FormField
                control={form.control}
                name="wo_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Instructions / Special Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide specific instructions for the maintenance team..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
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
