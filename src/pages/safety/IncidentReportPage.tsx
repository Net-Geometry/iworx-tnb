import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IncidentReportForm } from "@/components/incidents/IncidentReportForm";
import { useIncidents } from "@/hooks/useIncidents";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflowTemplateInitializer } from "@/hooks/useWorkflowTemplateInitializer";
import { toast } from "sonner";

/**
 * IncidentReportPage Component
 * 
 * Dedicated page for reporting safety incidents with full form layout.
 * Provides a comprehensive interface for technicians to submit detailed incident reports
 * and optionally generate work orders for asset-related incidents.
 */
const IncidentReportPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentOrganization } = useAuth();
  const { createIncident } = useIncidents();
  const { createWorkOrder } = useWorkOrders();
  const { mutateAsync: initializeWorkflow } = useWorkflowTemplateInitializer();

  /**
   * Handle incident report form submission
   * Creates the incident record and optionally generates a work order
   */
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Create the incident report
      const incidentData = {
        incident_type: data.incident_type,
        severity: data.severity,
        description: data.description,
        location: data.location,
        asset_id: data.asset_id || null,
        reported_by: data.reported_by,
        reported_date: data.reported_date,
        attachment_urls: data.attachments?.map((file: any) => file.url) || [],
        attachment_metadata: data.attachments || [],
      };

      const newIncident = await createIncident(incidentData);

      // Initialize workflow for the incident
      try {
        await initializeWorkflow({
          entityId: newIncident.id,
          entityType: "incident",
          organizationId: currentOrganization?.id || "",
        });
        console.log("✅ Workflow initialized successfully");
      } catch (workflowError) {
        console.error("⚠️ Workflow initialization failed:", workflowError);
        // Don't block incident creation if workflow fails
      }

      // Create work order if requested and asset is involved
      if (data.create_work_order && data.asset_id) {
        const priorityMap: Record<string, "critical" | "high" | "medium" | "low"> = {
          critical: "high",
          high: "high",
          medium: "medium",
          low: "low",
        };

        const workOrderData = {
          asset_id: data.asset_id,
          title: `Incident Response: ${data.incident_type}`,
          description: `Work order created from incident report:\n\n${data.description}`,
          status: "scheduled" as const,
          priority: (priorityMap[data.severity] || "medium") as "critical" | "high" | "medium" | "low",
          maintenance_type: "corrective" as const,
          scheduled_date: new Date().toISOString(),
          organization_id: currentOrganization?.id || "",
          incident_report_id: newIncident?.id,
        };

        await createWorkOrder(workOrderData);
        toast.success("Incident reported and work order created successfully");
      } else {
        toast.success("Incident reported successfully");
      }

      // Navigate to incident detail page
      navigate(`/safety/incidents/${newIncident.id}`);
    } catch (error: any) {
      console.error("Error submitting incident report:", error);
      toast.error(error.message || "Failed to submit incident report");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle form cancellation
   * Navigate back to incidents list
   */
  const handleCancel = () => {
    navigate("/safety/incidents");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/safety">Safety</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/safety/incidents">Incidents</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Report New Incident</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Report Safety Incident</h1>
              <p className="text-muted-foreground">
                Provide detailed information about the incident
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentReportForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentReportPage;
