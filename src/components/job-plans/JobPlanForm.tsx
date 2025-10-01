import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { useCreateJobPlan, useUpdateJobPlan, type JobPlanWithDetails, type CreateJobPlanData } from "@/hooks/useJobPlans";

const formSchema = z.object({
  job_plan_number: z.string().min(1, "Job plan number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  job_type: z.enum(["preventive", "corrective", "predictive", "emergency", "shutdown"]),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  estimated_duration_hours: z.number().min(0).optional(),
  skill_level_required: z.enum(["basic", "intermediate", "advanced", "specialist"]),
  priority: z.string().default("medium"),
  cost_estimate: z.number().min(0).optional(),
  frequency_type: z.enum(["time_based", "usage_based", "condition_based"]),
  frequency_interval: z.number().min(1).optional(),
  applicable_asset_types: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface NewTask {
  task_sequence: number;
  task_title: string;
  task_description: string;
  estimated_duration_minutes: number;
  skill_required: string;
  is_critical_step: boolean;
  completion_criteria: string;
  notes: string;
  safety_precaution_ids: string[];
  meter_group_id?: string;
}

interface NewPart {
  part_name: string;
  part_number: string;
  quantity_required: number;
  is_critical_part: boolean;
  notes: string;
  alternative_part_ids: string[];
  inventory_item_id: string | null;
}

interface NewTool {
  tool_name: string;
  tool_description: string;
  is_specialized_tool: boolean;
  quantity_required: number;
  notes: string;
}

interface JobPlanFormProps {
  jobPlan?: JobPlanWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
}

export const JobPlanForm = ({ jobPlan, open, onOpenChange, mode = "create" }: JobPlanFormProps) => {
  const [currentTab, setCurrentTab] = useState("basic");
  const [tasks, setTasks] = useState<NewTask[]>(jobPlan?.tasks?.map(t => ({
    task_sequence: t.task_sequence,
    task_title: t.task_title,
    task_description: t.task_description || "",
    estimated_duration_minutes: t.estimated_duration_minutes || 0,
    skill_required: t.skill_required || "",
    is_critical_step: t.is_critical_step,
    completion_criteria: t.completion_criteria || "",
    notes: t.notes || "",
    safety_precaution_ids: t.safety_precaution_ids || [],
  })) || []);
  const [parts, setParts] = useState<NewPart[]>(jobPlan?.parts?.map(p => ({
    part_name: p.part_name,
    part_number: p.part_number || "",
    quantity_required: p.quantity_required,
    is_critical_part: p.is_critical_part,
    notes: p.notes || "",
    alternative_part_ids: p.alternative_part_ids || [],
    inventory_item_id: p.inventory_item_id,
  })) || []);
  const [tools, setTools] = useState<NewTool[]>(jobPlan?.tools?.map(t => ({
    tool_name: t.tool_name,
    tool_description: t.tool_description || "",
    is_specialized_tool: t.is_specialized_tool,
    quantity_required: t.quantity_required,
    notes: t.notes || "",
  })) || []);
  const [assetTypes, setAssetTypes] = useState<string[]>(jobPlan?.applicable_asset_types || []);
  const [newAssetType, setNewAssetType] = useState("");

  const createJobPlan = useCreateJobPlan();
  const updateJobPlan = useUpdateJobPlan();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_plan_number: jobPlan?.job_plan_number || "",
      title: jobPlan?.title || "",
      description: jobPlan?.description || "",
      job_type: jobPlan?.job_type || "preventive",
      category: jobPlan?.category || "",
      subcategory: jobPlan?.subcategory || "",
      estimated_duration_hours: jobPlan?.estimated_duration_hours || undefined,
      skill_level_required: jobPlan?.skill_level_required || "basic",
      priority: jobPlan?.priority || "medium",
      cost_estimate: jobPlan?.cost_estimate || undefined,
      frequency_type: jobPlan?.frequency_type || "time_based",
      frequency_interval: jobPlan?.frequency_interval || undefined,
      applicable_asset_types: jobPlan?.applicable_asset_types || [],
    },
  });

  const addAssetType = () => {
    if (newAssetType.trim() && !assetTypes.includes(newAssetType.trim())) {
      setAssetTypes([...assetTypes, newAssetType.trim()]);
      setNewAssetType("");
    }
  };

  const removeAssetType = (type: string) => {
    setAssetTypes(assetTypes.filter(t => t !== type));
  };

  const addTask = () => {
    setTasks([...tasks, {
      task_sequence: tasks.length + 1,
      task_title: "",
      task_description: "",
      estimated_duration_minutes: 0,
      skill_required: "",
      is_critical_step: false,
      completion_criteria: "",
      notes: "",
      safety_precaution_ids: [],
    }]);
  };

  const addPart = () => {
    setParts([...parts, {
      part_name: "",
      part_number: "",
      quantity_required: 1,
      is_critical_part: false,
      notes: "",
      alternative_part_ids: [],
      inventory_item_id: null,
    }]);
  };

  const addTool = () => {
    setTools([...tools, {
      tool_name: "",
      tool_description: "",
      is_specialized_tool: false,
      quantity_required: 1,
      notes: "",
    }]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const jobPlanData: CreateJobPlanData = {
        job_plan_number: data.job_plan_number,
        title: data.title,
        description: data.description,
        job_type: data.job_type,
        category: data.category,
        subcategory: data.subcategory,
        estimated_duration_hours: data.estimated_duration_hours,
        skill_level_required: data.skill_level_required,
        priority: data.priority,
        cost_estimate: data.cost_estimate,
        frequency_type: data.frequency_type,
        frequency_interval: data.frequency_interval,
        applicable_asset_types: assetTypes,
        tasks: tasks.map(task => ({
          task_sequence: task.task_sequence,
          task_title: task.task_title,
          task_description: task.task_description,
          estimated_duration_minutes: task.estimated_duration_minutes,
          skill_required: task.skill_required,
          is_critical_step: task.is_critical_step,
          completion_criteria: task.completion_criteria,
          notes: task.notes,
          safety_precaution_ids: task.safety_precaution_ids,
          meter_group_id: task.meter_group_id,
        })),
        parts: parts.map(part => ({
          part_name: part.part_name,
          part_number: part.part_number,
          quantity_required: part.quantity_required,
          is_critical_part: part.is_critical_part,
          notes: part.notes,
          alternative_part_ids: part.alternative_part_ids,
          inventory_item_id: part.inventory_item_id,
        })),
        tools: tools.map(tool => ({
          tool_name: tool.tool_name,
          tool_description: tool.tool_description,
          is_specialized_tool: tool.is_specialized_tool,
          quantity_required: tool.quantity_required,
          notes: tool.notes,
        })),
      };

      if (mode === "edit" && jobPlan) {
        await updateJobPlan.mutateAsync({ id: jobPlan.id, ...data });
      } else {
        await createJobPlan.mutateAsync(jobPlanData);
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving job plan:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Job Plan" : "Create New Job Plan"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="job_plan_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Plan Number</FormLabel>
                        <FormControl>
                          <Input placeholder="JP-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="job_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="corrective">Corrective</SelectItem>
                            <SelectItem value="predictive">Predictive</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="shutdown">Shutdown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Job plan title..." {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the job plan..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Electrical" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skill_level_required"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="specialist">Specialist</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_duration_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label>Applicable Asset Types</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add asset type..."
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssetType())}
                    />
                    <Button type="button" onClick={addAssetType} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assetTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {type}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeAssetType(type)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Task Breakdown</h3>
                  <Button type="button" onClick={addTask} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-sm">Task {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input
                          placeholder="Task title..."
                          value={task.task_title}
                          onChange={(e) => {
                            const newTasks = [...tasks];
                            newTasks[index].task_title = e.target.value;
                            setTasks(newTasks);
                          }}
                        />
                        <Textarea
                          placeholder="Task description..."
                          value={task.task_description || ""}
                          onChange={(e) => {
                            const newTasks = [...tasks];
                            newTasks[index].task_description = e.target.value;
                            setTasks(newTasks);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Parts & Materials</h3>
                    <Button type="button" onClick={addPart} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Part
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {parts.map((part, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              placeholder="Part name..."
                              value={part.part_name}
                              onChange={(e) => {
                                const newParts = [...parts];
                                newParts[index].part_name = e.target.value;
                                setParts(newParts);
                              }}
                            />
                            <Input
                              placeholder="Part number..."
                              value={part.part_number || ""}
                              onChange={(e) => {
                                const newParts = [...parts];
                                newParts[index].part_number = e.target.value;
                                setParts(newParts);
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Quantity..."
                              value={part.quantity_required}
                              onChange={(e) => {
                                const newParts = [...parts];
                                newParts[index].quantity_required = Number(e.target.value);
                                setParts(newParts);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Tools & Equipment</h3>
                    <Button type="button" onClick={addTool} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tool
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {tools.map((tool, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Tool name..."
                              value={tool.tool_name}
                              onChange={(e) => {
                                const newTools = [...tools];
                                newTools[index].tool_name = e.target.value;
                                setTools(newTools);
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Quantity..."
                              value={tool.quantity_required}
                              onChange={(e) => {
                                const newTools = [...tools];
                                newTools[index].quantity_required = Number(e.target.value);
                                setTools(newTools);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Plan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <strong>Title:</strong> {form.watch("title")}
                    </div>
                    <div>
                      <strong>Type:</strong> {form.watch("job_type")}
                    </div>
                    <div>
                      <strong>Tasks:</strong> {tasks.length} tasks defined
                    </div>
                    <div>
                      <strong>Parts:</strong> {parts.length} parts required
                    </div>
                    <div>
                      <strong>Tools:</strong> {tools.length} tools required
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createJobPlan.isPending || updateJobPlan.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {mode === "edit" ? "Update" : "Create"} Job Plan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};