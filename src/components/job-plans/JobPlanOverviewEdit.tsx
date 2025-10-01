import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useUpdateJobPlan } from "@/hooks/useJobPlans";

interface JobPlanOverviewEditProps {
  jobPlan: any;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

export function JobPlanOverviewEdit({ jobPlan, onCancel, onSaveSuccess }: JobPlanOverviewEditProps) {
  const [formData, setFormData] = useState({
    title: jobPlan.title || "",
    description: jobPlan.description || "",
    estimated_duration_hours: jobPlan.estimated_duration_hours || "",
    skill_level_required: jobPlan.skill_level_required || "basic",
    frequency_type: jobPlan.frequency_type || "time_based",
    frequency_interval: jobPlan.frequency_interval || "",
    cost_estimate: jobPlan.cost_estimate || "",
    status: jobPlan.status || "draft",
    job_type: jobPlan.job_type || "preventive",
    priority: jobPlan.priority || "medium",
    applicable_asset_types: jobPlan.applicable_asset_types?.join(", ") || "",
  });

  const updateJobPlan = useUpdateJobPlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      estimated_duration_hours: formData.estimated_duration_hours ? parseFloat(formData.estimated_duration_hours) : null,
      frequency_interval: formData.frequency_interval ? parseInt(formData.frequency_interval) : null,
      cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
      applicable_asset_types: formData.applicable_asset_types 
        ? formData.applicable_asset_types.split(",").map(t => t.trim()).filter(Boolean)
        : null,
    };

    updateJobPlan.mutate(
      { id: jobPlan.id, ...updateData },
      {
        onSuccess: () => {
          onSaveSuccess();
        },
      }
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger id="job_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration_hours">Estimated Duration (hours)</Label>
              <Input
                id="estimated_duration_hours"
                type="number"
                step="0.1"
                value={formData.estimated_duration_hours}
                onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill_level_required">Skill Level Required</Label>
              <Select
                value={formData.skill_level_required}
                onValueChange={(value) => setFormData({ ...formData, skill_level_required: value })}
              >
                <SelectTrigger id="skill_level_required">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_type">Frequency Type</Label>
              <Select
                value={formData.frequency_type}
                onValueChange={(value) => setFormData({ ...formData, frequency_type: value })}
              >
                <SelectTrigger id="frequency_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_based">Time Based</SelectItem>
                  <SelectItem value="usage_based">Usage Based</SelectItem>
                  <SelectItem value="condition_based">Condition Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_interval">Frequency Interval (days)</Label>
              <Input
                id="frequency_interval"
                type="number"
                value={formData.frequency_interval}
                onChange={(e) => setFormData({ ...formData, frequency_interval: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_estimate">Cost Estimate</Label>
              <Input
                id="cost_estimate"
                type="number"
                step="0.01"
                value={formData.cost_estimate}
                onChange={(e) => setFormData({ ...formData, cost_estimate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicable_asset_types">Applicable Asset Types (comma-separated)</Label>
              <Input
                id="applicable_asset_types"
                value={formData.applicable_asset_types}
                onChange={(e) => setFormData({ ...formData, applicable_asset_types: e.target.value })}
                placeholder="e.g., Pump, Motor, Valve"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateJobPlan.isPending}>
              {updateJobPlan.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
