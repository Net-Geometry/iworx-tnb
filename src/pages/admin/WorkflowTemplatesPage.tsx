import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Copy, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkflowTemplates, useDeleteWorkflowTemplate, useSetDefaultTemplate } from "@/hooks/useWorkflowTemplates";
import { useWorkflowStatus, useWorkflowBulkInitializer } from "@/hooks/useWorkflowBulkInitializer";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Layout } from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

export default function WorkflowTemplatesPage() {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<"work_orders" | "safety_incidents">("work_orders");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const { data: templates, isLoading } = useWorkflowTemplates(selectedModule);
  const { data: workflowStatus, isLoading: statusLoading } = useWorkflowStatus(selectedModule);
  const deleteTemplate = useDeleteWorkflowTemplate();
  const setDefault = useSetDefaultTemplate();
  const bulkInitializer = useWorkflowBulkInitializer();

  const handleCreateNew = () => {
    navigate(`/admin/workflow-designer?module=${selectedModule}`);
  };

  const handleEdit = (templateId: string) => {
    navigate(`/admin/workflow-designer/${templateId}`);
  };

  const handleDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate.mutate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSetDefault = (templateId: string) => {
    setDefault.mutate({ templateId, module: selectedModule });
  };

  const handleBulkInitialize = () => {
    bulkInitializer.mutate({ module: selectedModule });
  };

  return (
    <AdminGuard>
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Workflow Templates</h1>
              <p className="text-muted-foreground">
                Create and manage custom workflow templates for your organization
              </p>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>

          {/* Module Selector */}
          <Tabs value={selectedModule} onValueChange={(v) => setSelectedModule(v as any)}>
            <TabsList>
              <TabsTrigger value="work_orders">Work Orders</TabsTrigger>
              <TabsTrigger value="safety_incidents">Safety Incidents</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedModule} className="space-y-4 mt-6">
              {/* Workflow Management Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Management</CardTitle>
                  <CardDescription>
                    Initialize workflows for {selectedModule === "work_orders" ? "work orders" : "safety incidents"} that don't have one configured
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusLoading ? (
                    <div className="text-sm text-muted-foreground">Loading status...</div>
                  ) : workflowStatus ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">{workflowStatus.totalEntities}</div>
                          <div className="text-sm text-muted-foreground">Total Entities</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-green-600">{workflowStatus.withWorkflow}</div>
                          <div className="text-sm text-muted-foreground">With Workflow</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-orange-600">{workflowStatus.withoutWorkflow}</div>
                          <div className="text-sm text-muted-foreground">Missing Workflow</div>
                        </div>
                      </div>
                      
                      {workflowStatus.hasDefaultTemplate && workflowStatus.withoutWorkflow > 0 && (
                        <Button 
                          onClick={handleBulkInitialize}
                          disabled={bulkInitializer.isPending}
                          className="w-full"
                        >
                          {bulkInitializer.isPending 
                            ? "Initializing..." 
                            : `Initialize Workflows for ${workflowStatus.withoutWorkflow} Entities`}
                        </Button>
                      )}

                      {!workflowStatus.hasDefaultTemplate && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                          No default workflow template configured for this module. Set a template as default to enable bulk initialization.
                        </div>
                      )}

                      {workflowStatus.withoutWorkflow === 0 && workflowStatus.totalEntities > 0 && (
                        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                          All entities have workflows configured!
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Separator />

              {/* Templates List */}
              {isLoading ? (
                <div className="text-center py-12">Loading templates...</div>
              ) : templates && templates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {template.name}
                              {template.is_default && (
                                <Badge variant="default" className="gap-1">
                                  <Check className="w-3 h-3" />
                                  Default
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template.id)}
                            className="gap-2 flex-1"
                          >
                            <Settings className="w-4 h-4" />
                            Configure
                          </Button>
                          {!template.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(template.id)}
                              className="gap-2"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          Version {template.version} • Updated {new Date(template.updated_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      No workflow templates found for {selectedModule === "work_orders" ? "Work Orders" : "Safety Incidents"}
                    </p>
                    <Button onClick={handleCreateNew} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workflow Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this workflow template? This action cannot be undone
                  and will affect any work orders or incidents using this template.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Layout>
    </AdminGuard>
  );
}
