import { useState } from "react";
import { Clock, User, Eye, Edit, Copy, Archive, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobPlanDetailsModal } from "./JobPlanDetailsModal";
import { JobPlanForm } from "./JobPlanForm";
import type { JobPlanWithDetails } from "@/hooks/useJobPlans";

interface JobPlanCardProps {
  jobPlan: JobPlanWithDetails;
}

export const JobPlanCard = ({ jobPlan }: JobPlanCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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
    <>
      <Card className="bg-gradient-card border-border/50 hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {jobPlan.job_plan_number}
                </CardTitle>
                <Badge className={getStatusColor(jobPlan.status)}>
                  {jobPlan.status?.replace('_', ' ')}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2">{jobPlan.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {jobPlan.description || "No description provided"}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className={getJobTypeColor(jobPlan.job_type)}>
              {jobPlan.job_type}
            </Badge>
            {jobPlan.category && (
              <Badge variant="outline">{jobPlan.category}</Badge>
            )}
            {jobPlan.skill_level_required && (
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" />
                {jobPlan.skill_level_required}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {jobPlan.estimated_duration_hours ? `${jobPlan.estimated_duration_hours}h` : "N/A"}
            </div>
            <div className="text-right">
              <div>Used {jobPlan.usage_count || 0} times</div>
              <div className="text-xs">v{jobPlan.version}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(true)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <JobPlanDetailsModal
        jobPlan={jobPlan}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <JobPlanForm
        jobPlan={jobPlan}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        mode="edit"
      />
    </>
  );
};