import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, List, Workflow } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Layout } from "@/components/Layout";
import {
  useWorkflowTemplate,
  useCreateWorkflowTemplate,
  useUpdateWorkflowTemplate,
} from "@/hooks/useWorkflowTemplates";
import {
  useWorkflowTemplateSteps,
  useCreateWorkflowStep,
  useUpdateWorkflowStep,
  useDeleteWorkflowStep,
} from "@/hooks/useWorkflowTemplateSteps";
import { WorkflowStepCard } from "@/components/workflow/designer/WorkflowStepCard";
import { StepConfigurationModal } from "@/components/workflow/designer/StepConfigurationModal";
import { WorkflowVisualizer } from "@/components/workflow/WorkflowVisualizer";
import type { WorkflowTemplateStep } from "@/hooks/useWorkflowTemplateSteps";

export default function WorkflowDesignerPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleParam = searchParams.get("module") as "work_orders" | "safety_incidents" | null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState<"work_orders" | "safety_incidents">(moduleParam || "work_orders");
  const [isActive, setIsActive] = useState(true);
  const [selectedStep, setSelectedStep] = useState<WorkflowTemplateStep | null>(null);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "visual">("list");

  const { data: template } = useWorkflowTemplate(templateId);
  const { data: steps = [] } = useWorkflowTemplateSteps(templateId);
  const createTemplate = useCreateWorkflowTemplate();
  const updateTemplate = useUpdateWorkflowTemplate();
  const createStep = useCreateWorkflowStep();
  const updateStep = useUpdateWorkflowStep();
  const deleteStep = useDeleteWorkflowStep();

  // Load template data when editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setModule(template.module as any);
      setIsActive(template.is_active);
    }
  }, [template]);

  const handleSaveTemplate = async () => {
    if (templateId) {
      updateTemplate.mutate({ 
        id: templateId,
        name,
        description,
        is_active: isActive,
      });
    } else {
      // Get current user's organization
      const { data: userOrgs } = await supabase
        .from("user_organizations")
        .select("organization_id")
        .limit(1)
        .single();

      if (!userOrgs) {
        toast.error("Unable to determine organization");
        return;
      }

      createTemplate.mutate({
        name,
        description,
        module,
        organization_id: userOrgs.organization_id,
        is_active: isActive,
        is_default: false,
        version: 1,
      }, {
        onSuccess: (newTemplate) => {
          navigate(`/admin/workflow-designer/${newTemplate.id}`);
        },
      });
    }
  };

  const handleAddStep = () => {
    setSelectedStep(null);
    setIsStepModalOpen(true);
  };

  const handleEditStep = (step: WorkflowTemplateStep) => {
    setSelectedStep(step);
    setIsStepModalOpen(true);
  };

  const handleSaveStep = async (stepData: Partial<WorkflowTemplateStep>) => {
    if (!templateId || !template) return;

    if (selectedStep) {
      updateStep.mutate({ id: selectedStep.id, ...stepData });
    } else {
      // Ensure all required fields are present
      if (!stepData.name || !stepData.step_type) {
        toast.error("Step name and type are required");
        return;
      }

      createStep.mutate({
        name: stepData.name,
        description: stepData.description || null,
        template_id: templateId,
        step_order: steps.length + 1,
        step_type: stepData.step_type,
        sla_hours: stepData.sla_hours || null,
        is_required: stepData.is_required ?? true,
        approval_type: stepData.approval_type || 'single',
        auto_assign_enabled: stepData.auto_assign_enabled || false,
        allows_work_order_creation: stepData.allows_work_order_creation || false,
        auto_assign_logic: stepData.auto_assign_logic || null,
        form_fields: stepData.form_fields || null,
        work_order_status: stepData.work_order_status || null,
        incident_status: stepData.incident_status || null,
        organization_id: template.organization_id,
      });
    }
    setIsStepModalOpen(false);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!templateId) return;
    deleteStep.mutate({ stepId, templateId });
  };

  return (
    <AdminGuard>
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/workflow-templates")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {templateId ? "Edit Workflow Template" : "Create Workflow Template"}
              </h1>
              <p className="text-muted-foreground">Design a custom workflow for your organization</p>
            </div>
            <Button onClick={handleSaveTemplate} className="gap-2">
              <Save className="w-4 h-4" />
              Save Template
            </Button>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Template Details</TabsTrigger>
              <TabsTrigger value="steps" disabled={!templateId}>
                Workflow Steps ({steps.length})
              </TabsTrigger>
            </TabsList>

            {/* Template Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>Configure the basic details of your workflow template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Emergency Maintenance Workflow"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe when and how this workflow should be used..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module">Module *</Label>
                    <Select value={module} onValueChange={(v) => setModule(v as any)}>
                      <SelectTrigger id="module">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work_orders">Work Orders</SelectItem>
                        <SelectItem value="safety_incidents">Safety Incidents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active">Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Inactive templates won't be available for selection
                      </p>
                    </div>
                    <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workflow Steps Tab */}
            <TabsContent value="steps" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Workflow Steps</h2>
                  <p className="text-sm text-muted-foreground">
                    Define the steps and their order in this workflow
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {steps.length > 0 && (
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="gap-2"
                      >
                        <List className="w-4 h-4" />
                        List
                      </Button>
                      <Button
                        variant={viewMode === "visual" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("visual")}
                        className="gap-2"
                      >
                        <Workflow className="w-4 h-4" />
                        Visual
                      </Button>
                    </div>
                  )}
                  <Button onClick={handleAddStep} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Step
                  </Button>
                </div>
              </div>

              {steps.length > 0 ? (
                viewMode === "list" ? (
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <WorkflowStepCard
                        key={step.id}
                        step={step}
                        stepNumber={index + 1}
                        onEdit={handleEditStep}
                        onDelete={handleDeleteStep}
                      />
                    ))}
                  </div>
                ) : (
                  <WorkflowVisualizer steps={steps} />
                )
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No steps defined yet</p>
                    <Button onClick={handleAddStep} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Your First Step
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Step Configuration Modal */}
          {templateId && (
            <StepConfigurationModal
              open={isStepModalOpen}
              onOpenChange={setIsStepModalOpen}
              step={selectedStep}
              onSave={handleSaveStep}
            />
          )}
        </div>
      </Layout>
    </AdminGuard>
  );
}
