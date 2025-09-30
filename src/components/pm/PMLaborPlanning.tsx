import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { usePeople } from "@/hooks/usePeople";

/**
 * PMLaborPlanning Component
 * Displays labor planning information including time and cost estimation
 */

interface PMLaborPlanningProps {
  assignedPersonId?: string;
  estimatedDurationHours?: number;
  onLaborCostChange?: (cost: number) => void;
}

export const PMLaborPlanning = ({ 
  assignedPersonId, 
  estimatedDurationHours = 0,
  onLaborCostChange 
}: PMLaborPlanningProps) => {
  const { people } = usePeople();
  
  const assignedPerson = people.find(p => p.id === assignedPersonId);
  const hourlyRate = assignedPerson?.hourly_rate || 0;
  const laborCost = estimatedDurationHours * hourlyRate;

  // Notify parent of labor cost
  if (onLaborCostChange && laborCost > 0) {
    onLaborCostChange(laborCost);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Labor Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assigned Person Info */}
        <div className="space-y-2">
          <Label>Assigned Person</Label>
          <div className="p-3 rounded-lg bg-muted">
            {assignedPerson ? (
              <div className="space-y-1">
                <div className="font-medium">
                  {assignedPerson.first_name} {assignedPerson.last_name}
                </div>
                {assignedPerson.job_title && (
                  <div className="text-sm text-muted-foreground">
                    {assignedPerson.job_title}
                  </div>
                )}
                {assignedPerson.employee_number && (
                  <div className="text-xs text-muted-foreground">
                    Employee #: {assignedPerson.employee_number}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No person assigned
              </div>
            )}
          </div>
        </div>

        {/* Time Estimation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Hours
            </Label>
            <Input
              type="number"
              value={estimatedDurationHours}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>Hourly Rate</Label>
            <Input
              type="number"
              value={hourlyRate}
              disabled
              className="bg-muted"
              placeholder="Not set"
            />
          </div>
        </div>

        {/* Cost Calculation */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated Labor Cost</span>
            <span className="text-lg font-bold text-primary">
              ${laborCost.toFixed(2)}
            </span>
          </div>
          {!hourlyRate && assignedPerson && (
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Hourly rate not set for this person
            </p>
          )}
          {!assignedPerson && (
            <p className="text-xs text-muted-foreground mt-2">
              Assign a person to calculate labor cost
            </p>
          )}
        </div>

        {/* Department Info */}
        {assignedPerson?.department && (
          <div className="space-y-2">
            <Label>Department</Label>
            <div className="p-2 rounded-lg bg-muted text-sm">
              {assignedPerson.department}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
