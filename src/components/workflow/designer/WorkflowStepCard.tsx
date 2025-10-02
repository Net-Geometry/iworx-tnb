import { Edit, Trash2, Clock, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkflowTemplateStep } from "@/hooks/useWorkflowTemplateSteps";
import { useStepRoleAssignments } from "@/hooks/useWorkflowTemplateSteps";
import { useRoles } from "@/hooks/useRoles";

interface WorkflowStepCardProps {
  step: WorkflowTemplateStep;
  stepNumber: number;
  onEdit: (step: WorkflowTemplateStep) => void;
  onDelete: (stepId: string) => void;
}

export const WorkflowStepCard = ({ step, stepNumber, onEdit, onDelete }: WorkflowStepCardProps) => {
  const { data: roleAssignments } = useStepRoleAssignments(step.id);
  const { roles } = useRoles();

  const assignedRoles = roleAssignments?.map(ra => {
    const role = roles.find(r => r.id === ra.role_id);
    return role?.display_name;
  }).filter(Boolean);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {stepNumber}
            </div>
            <div>
              <CardTitle className="text-lg">{step.name}</CardTitle>
              {step.description && (
                <CardDescription className="mt-1">{step.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(step)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(step.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {step.step_type.replace("_", " ")}
            </Badge>
            {step.approval_type !== "single" && (
              <Badge variant="secondary" className="capitalize">
                {step.approval_type} Approval
              </Badge>
            )}
            {step.sla_hours && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {step.sla_hours}h SLA
              </Badge>
            )}
            {step.is_required && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Required
              </Badge>
            )}
            {step.auto_assign_enabled && (
              <Badge variant="default">Auto-Assign</Badge>
            )}
            {step.work_order_status && (
              <Badge variant="outline" className="capitalize">
                WO Status: {step.work_order_status.replace("_", " ")}
              </Badge>
            )}
          </div>
          {assignedRoles && assignedRoles.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Roles: {assignedRoles.join(", ")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
