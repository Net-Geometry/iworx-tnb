import { Clock, User, Calendar, DollarSign, Package, Wrench, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { JobPlanWithDetails } from "@/hooks/useJobPlans";

interface JobPlanDetailsModalProps {
  jobPlan: JobPlanWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobPlanDetailsModal = ({ jobPlan, open, onOpenChange }: JobPlanDetailsModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'under_review':
        return 'bg-info/10 text-info border-info/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'preventive':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'corrective':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'predictive':
        return 'bg-info/10 text-info border-info/20';
      case 'emergency':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'shutdown':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{jobPlan.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{jobPlan.job_plan_number}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(jobPlan.status)}>
                {jobPlan.status?.replace('_', ' ')}
              </Badge>
              <Badge className={getJobTypeColor(jobPlan.job_type)}>
                {jobPlan.job_type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{jobPlan.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {jobPlan.estimated_duration_hours ? `${jobPlan.estimated_duration_hours}h` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Skill Level</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {jobPlan.skill_level_required}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Frequency</p>
                    <p className="text-sm text-muted-foreground">
                      {jobPlan.frequency_interval} {jobPlan.frequency_type?.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Est. Cost</p>
                    <p className="text-sm text-muted-foreground">
                      {jobPlan.cost_estimate ? `$${jobPlan.cost_estimate}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {jobPlan.applicable_asset_types && jobPlan.applicable_asset_types.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Applicable Asset Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {jobPlan.applicable_asset_types.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks" className="gap-2">
                <FileText className="w-4 h-4" />
                Tasks ({jobPlan.tasks?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="parts" className="gap-2">
                <Package className="w-4 h-4" />
                Parts ({jobPlan.parts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2">
                <Wrench className="w-4 h-4" />
                Tools ({jobPlan.tools?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              {jobPlan.tasks && jobPlan.tasks.length > 0 ? (
                jobPlan.tasks
                  .sort((a, b) => a.task_sequence - b.task_sequence)
                  .map((task, index) => (
                    <Card key={task.id || index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Step {task.task_sequence}: {task.task_title}
                          </CardTitle>
                          {task.is_critical_step && (
                            <Badge variant="destructive">Critical</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {task.task_description && (
                          <p className="text-sm text-muted-foreground">{task.task_description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          {task.estimated_duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimated_duration_minutes} min
                            </div>
                          )}
                          {task.skill_required && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.skill_required}
                            </div>
                          )}
                        </div>

                        {task.completion_criteria && (
                          <div>
                            <p className="text-sm font-medium">Completion Criteria:</p>
                            <p className="text-sm text-muted-foreground">{task.completion_criteria}</p>
                          </div>
                        )}

                        {task.notes && (
                          <div>
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-muted-foreground">{task.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No tasks defined for this job plan</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="parts" className="space-y-4">
              {jobPlan.parts && jobPlan.parts.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Part Name</th>
                            <th className="text-left p-4 font-medium">Part Number</th>
                            <th className="text-left p-4 font-medium">Quantity</th>
                            <th className="text-left p-4 font-medium">Critical</th>
                            <th className="text-left p-4 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobPlan.parts.map((part, index) => (
                            <tr key={part.id || index} className="border-b">
                              <td className="p-4">{part.part_name}</td>
                              <td className="p-4 text-muted-foreground">{part.part_number || "N/A"}</td>
                              <td className="p-4">{part.quantity_required}</td>
                              <td className="p-4">
                                {part.is_critical_part && (
                                  <Badge variant="destructive">Critical</Badge>
                                )}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{part.notes || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No parts defined for this job plan</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              {jobPlan.tools && jobPlan.tools.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Tool Name</th>
                            <th className="text-left p-4 font-medium">Description</th>
                            <th className="text-left p-4 font-medium">Quantity</th>
                            <th className="text-left p-4 font-medium">Specialized</th>
                            <th className="text-left p-4 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobPlan.tools.map((tool, index) => (
                            <tr key={tool.id || index} className="border-b">
                              <td className="p-4">{tool.tool_name}</td>
                              <td className="p-4 text-muted-foreground">{tool.tool_description || "N/A"}</td>
                              <td className="p-4">{tool.quantity_required}</td>
                              <td className="p-4">
                                {tool.is_specialized_tool && (
                                  <Badge variant="secondary">Specialized</Badge>
                                )}
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{tool.notes || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Wrench className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No tools defined for this job plan</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span> {jobPlan.version}
                </div>
                <div>
                  <span className="font-medium">Usage Count:</span> {jobPlan.usage_count || 0}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {jobPlan.created_at ? new Date(jobPlan.created_at).toLocaleDateString() : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {jobPlan.updated_at ? new Date(jobPlan.updated_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};