import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Wrench, Loader2 } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { useHierarchyNodes, useHierarchyLevels } from "@/hooks/useHierarchyData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  root_cause: z.string().optional(),
  corrective_actions: z.string().optional(),
  cost_impact: z.coerce.number().optional(),
  regulatory_reporting_required: z.boolean().default(false),
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

interface Incident {
  id: string;
  incident_number?: string;
  title: string;
  description: string;
  incident_date: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  reporter_name?: string;
  reporter_email?: string;
  asset_id?: string;
  immediate_actions?: string;
  root_cause?: string;
  corrective_actions?: string;
  cost_impact?: number;
  regulatory_reporting_required?: boolean;
  wo_maintenance_type?: string;
  wo_priority?: string;
  wo_estimated_duration_hours?: number;
  wo_assigned_technician?: string;
  wo_estimated_cost?: number;
  wo_target_start_date?: string;
  wo_target_finish_date?: string;
  wo_notes?: string;
}

interface EditIncidentDialogProps {
  incident: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditIncidentDialog = ({
  incident,
  open,
  onOpenChange,
}: EditIncidentDialogProps) => {
  const { assets } = useAssets();
  const { levels } = useHierarchyLevels();
  const { nodes } = useHierarchyNodes();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const [selectedLocationNodeId, setSelectedLocationNodeId] = useState<string | undefined>();

  const filteredAssets = selectedLocationNodeId
    ? assets.filter(asset => asset.hierarchy_node_id === selectedLocationNodeId)
    : assets;

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: incident.incident_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      location: incident.location || "",
      severity: incident.severity || "medium",
      title: incident.title || "",
      description: incident.description || "",
      asset_id: incident.asset_id || undefined,
      reporter_name: incident.reporter_name || "",
      reporter_email: incident.reporter_email || "",
      immediate_actions: incident.immediate_actions || "",
      root_cause: incident.root_cause || "",
      corrective_actions: incident.corrective_actions || "",
      cost_impact: incident.cost_impact || undefined,
      regulatory_reporting_required: incident.regulatory_reporting_required || false,
      wo_maintenance_type: incident.wo_maintenance_type as any || undefined,
      wo_priority: incident.wo_priority as any || undefined,
      wo_estimated_duration_hours: incident.wo_estimated_duration_hours || undefined,
      wo_assigned_technician: incident.wo_assigned_technician || "",
      wo_estimated_cost: incident.wo_estimated_cost || undefined,
      wo_target_start_date: incident.wo_target_start_date || "",
      wo_target_finish_date: incident.wo_target_finish_date || "",
      wo_notes: incident.wo_notes || "",
    },
  });

  const hasWorkOrderData = !!(
    incident.wo_maintenance_type || 
    incident.wo_priority || 
    incident.wo_estimated_duration_hours ||
    incident.wo_estimated_cost
  );

  const [showWorkOrder, setShowWorkOrder] = useState(hasWorkOrderData);

  useEffect(() => {
    const severity = form.watch("severity");
    
    if (showWorkOrder && severity) {
      if (!form.watch("wo_priority")) {
        form.setValue("wo_priority", severity);
      }
      
      if (!form.watch("wo_maintenance_type")) {
        const maintenanceType = severity === "critical" || severity === "high" 
          ? "emergency" 
          : "corrective";
        form.setValue("wo_maintenance_type", maintenanceType);
      }
    }
  }, [form.watch("severity"), showWorkOrder]);

  const updateMutation = useMutation({
    mutationFn: async (data: IncidentFormValues) => {
      const { data: updated, error } = await supabase
        .from("safety_incidents")
        .update({
          title: data.title,
          description: data.description,
          incident_date: data.incident_date,
          location: data.location,
          severity: data.severity,
          reporter_name: data.reporter_name,
          reporter_email: data.reporter_email || null,
          asset_id: data.asset_id || null,
          immediate_actions: data.immediate_actions || null,
          root_cause: data.root_cause || null,
          corrective_actions: data.corrective_actions || null,
          cost_impact: data.cost_impact || null,
          regulatory_reporting_required: data.regulatory_reporting_required,
          wo_maintenance_type: data.wo_maintenance_type || null,
          wo_priority: data.wo_priority || null,
          wo_estimated_duration_hours: data.wo_estimated_duration_hours || null,
          wo_assigned_technician: data.wo_assigned_technician || null,
          wo_estimated_cost: data.wo_estimated_cost || null,
          wo_target_start_date: data.wo_target_start_date || null,
          wo_target_finish_date: data.wo_target_finish_date || null,
          wo_notes: data.wo_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", incident.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      toast({
        title: "Success",
        description: "Incident updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update incident",
      });
    },
  });

  const onSubmit = (data: IncidentFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Incident</DialogTitle>
          <DialogDescription>
            Update incident details. Changes will be tracked in the audit log.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="incident_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const selectedNode = locationNodes.find(node => node.name === value);
                      field.onChange(value);
                      setSelectedLocationNodeId(selectedNode?.id);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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

            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Involved</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="immediate_actions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Immediate Actions</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="root_cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Root Cause</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="corrective_actions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corrective Actions</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost_impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Impact ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regulatory_reporting_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-7">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Regulatory Reporting Required
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Work Order Planning Section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  checked={showWorkOrder}
                  onCheckedChange={(checked) => setShowWorkOrder(checked === true)}
                />
                <label className="text-base font-semibold flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Work Order Planning
                </label>
              </div>

              <Collapsible open={showWorkOrder}>
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectItem value="corrective">Corrective</SelectItem>
                              <SelectItem value="preventive">Preventive</SelectItem>
                              <SelectItem value="predictive">Predictive</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wo_priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="wo_target_finish_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Finish Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="wo_estimated_duration_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Duration (hours)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wo_estimated_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="wo_assigned_technician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wo_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
