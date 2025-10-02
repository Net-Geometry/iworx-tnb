import { format } from "date-fns";
import { CheckCircle, XCircle, UserPlus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalRecord } from "@/hooks/useWorkflowState";
import { cn } from "@/lib/utils";

interface WorkflowHistoryProps {
  approvals: ApprovalRecord[];
  className?: string;
}

/**
 * Timeline view of all workflow transitions and approvals
 */
export const WorkflowHistory = ({
  approvals,
  className,
}: WorkflowHistoryProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-accent-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "reassigned":
        return <UserPlus className="w-5 h-5 text-primary" />;
      case "escalated":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <CheckCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved":
        return "text-accent-success";
      case "rejected":
        return "text-destructive";
      case "reassigned":
        return "text-primary";
      case "escalated":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Workflow History</CardTitle>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workflow history yet</p>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval, index) => (
              <div key={approval.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center">
                    {getActionIcon(approval.approval_action)}
                  </div>
                  {index < approvals.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "font-medium capitalize",
                        getActionColor(approval.approval_action)
                      )}
                    >
                      {approval.approval_action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(approval.approved_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                  {approval.comments && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {approval.comments}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
