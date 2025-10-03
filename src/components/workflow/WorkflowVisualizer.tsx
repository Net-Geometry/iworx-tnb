import { ChevronDown, Clock, Users, CheckCircle2, UserCheck, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { WorkflowTemplateStep } from "@/hooks/useWorkflowTemplateSteps";
import { useStepRoleAssignments } from "@/hooks/useWorkflowTemplateSteps";

interface WorkflowVisualizerProps {
  steps: WorkflowTemplateStep[];
  currentStepId?: string;
  compact?: boolean;
}

/**
 * WorkflowVisualizer Component
 * 
 * Displays a vertical flowchart of workflow steps with:
 * - Color-coded steps by approval type
 * - Role assignments
 * - SLA indicators
 * - Current step highlighting
 */
export const WorkflowVisualizer = ({ steps, currentStepId, compact = false }: WorkflowVisualizerProps) => {
  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

  if (sortedSteps.length === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No workflow steps defined</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative space-y-2">
        {sortedSteps.map((step, index) => (
          <div key={step.id} className="relative">
            <WorkflowStepNode
              step={step}
              stepNumber={index + 1}
              isCurrentStep={step.id === currentStepId}
              compact={compact}
            />
            {index < sortedSteps.length - 1 && (
              <div className="flex justify-center py-2">
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

interface WorkflowStepNodeProps {
  step: WorkflowTemplateStep;
  stepNumber: number;
  isCurrentStep: boolean;
  compact: boolean;
}

const WorkflowStepNode = ({ step, stepNumber, isCurrentStep, compact }: WorkflowStepNodeProps) => {
  const { data: roleAssignments = [] } = useStepRoleAssignments(step.id);
  
  const approvalConfig = getApprovalConfig(step.approval_type || 'single');
  const roles = roleAssignments.map(r => r.role_name);

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isCurrentStep && "ring-2 ring-primary shadow-hover",
        approvalConfig.borderClass
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Step Number Badge */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
            approvalConfig.badgeClass
          )}>
            {stepNumber}
          </div>

          <div className="flex-1 min-w-0">
            {/* Step Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base truncate">{step.name}</h4>
                {step.description && !compact && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {step.description}
                  </p>
                )}
              </div>
              
              {isCurrentStep && (
                <Badge variant="default" className="flex-shrink-0">
                  Current
                </Badge>
              )}
            </div>

            {/* Step Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Approval Type */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {approvalConfig.icon}
                    <span className={cn("font-medium", approvalConfig.textClass)}>
                      {approvalConfig.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{approvalConfig.description}</p>
                </TooltipContent>
              </Tooltip>

              {/* SLA Hours */}
              {step.sla_hours && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{step.sla_hours}h SLA</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Service Level Agreement: {step.sla_hours} hours</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Required Badge */}
              {step.is_required && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            {/* Role Assignments */}
            {!compact && roles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((role, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Get visual configuration for each approval type
 */
function getApprovalConfig(approvalType: string) {
  switch (approvalType) {
    case 'none':
      return {
        label: 'Auto-transition',
        description: 'Step automatically transitions without approval',
        icon: <CheckCircle2 className="w-4 h-4" />,
        textClass: 'text-accent-success',
        badgeClass: 'bg-accent-success/20 text-accent-success border border-accent-success/30',
        borderClass: 'border-l-4 border-l-accent-success',
      };
    case 'single':
      return {
        label: 'Single Approval',
        description: 'Any assigned user can approve',
        icon: <UserCheck className="w-4 h-4" />,
        textClass: 'text-info',
        badgeClass: 'bg-info/20 text-info border border-info/30',
        borderClass: 'border-l-4 border-l-info',
      };
    case 'multiple':
      return {
        label: 'Multiple Approvals',
        description: 'Requires multiple approvals',
        icon: <UsersRound className="w-4 h-4" />,
        textClass: 'text-secondary-accent',
        badgeClass: 'bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/30',
        borderClass: 'border-l-4 border-l-secondary-accent',
      };
    case 'unanimous':
      return {
        label: 'Unanimous',
        description: 'All assigned users must approve',
        icon: <UsersRound className="w-4 h-4" />,
        textClass: 'text-warning',
        badgeClass: 'bg-warning/20 text-warning-foreground border border-warning/30',
        borderClass: 'border-l-4 border-l-warning',
      };
    default:
      return {
        label: 'Unknown',
        description: 'Unknown approval type',
        icon: <UserCheck className="w-4 h-4" />,
        textClass: 'text-muted-foreground',
        badgeClass: 'bg-muted text-muted-foreground border border-border',
        borderClass: 'border-l-4 border-l-muted',
      };
  }
}
