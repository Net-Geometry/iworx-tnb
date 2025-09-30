import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncidentReportForm } from "./IncidentReportForm";
import { useIncidents } from "@/hooks/useIncidents";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface IncidentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentReportDialog = ({
  open,
  onOpenChange,
}: IncidentReportDialogProps) => {
  const { createIncident } = useIncidents();
  const { createWorkOrder } = useWorkOrders();
  const { currentOrganization } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      // Create incident report
      const incident = await createIncident({
        incident_date: data.incident_date,
        location: data.location,
        severity: data.severity,
        status: 'reported',
        title: data.title,
        description: data.description,
        reporter_name: data.reporter_name,
        reporter_email: data.reporter_email || null,
        asset_id: data.asset_id || null,
        regulatory_reporting_required: data.regulatory_reporting_required,
        corrective_actions: data.immediate_actions || null,
      });

      // If create_work_order is checked and asset is involved, create work order
      if (data.create_work_order && data.asset_id && incident) {
        await createWorkOrder({
          asset_id: data.asset_id,
          title: `Incident Response: ${data.title}`,
          description: `Work order generated from incident report ${incident.incident_number}\n\n${data.description}`,
          maintenance_type: 'corrective',
          priority: data.severity === 'critical' || data.severity === 'high' ? 'high' : 'medium',
          scheduled_date: new Date().toISOString().split('T')[0],
          status: 'scheduled',
          notes: data.immediate_actions || '',
          organization_id: currentOrganization!.id,
          incident_report_id: incident.id,
          generation_type: 'manual',
        });

        toast({
          title: "Success",
          description: "Incident reported and work order created",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting incident:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Safety Incident</DialogTitle>
          <DialogDescription>
            Submit a detailed incident report. If asset damage or malfunction occurred,
            you can automatically generate a corrective work order.
          </DialogDescription>
        </DialogHeader>
        <IncidentReportForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
