import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Users, Clock } from "lucide-react";
import { usePeople } from "@/hooks/usePeople";
import { useEffect } from "react";

/**
 * PMLaborPlanning Component
 * Displays labor planning information including time and cost estimation for multiple assigned people
 */

interface PMLaborPlanningProps {
  assignedPersonIds?: string[];
  estimatedDurationHours?: number;
  onLaborCostChange?: (cost: number) => void;
}

export const PMLaborPlanning = ({ 
  assignedPersonIds = [], 
  estimatedDurationHours = 0,
  onLaborCostChange 
}: PMLaborPlanningProps) => {
  const { people } = usePeople();
  
  // Find all assigned people
  const assignedPeople = people.filter(p => assignedPersonIds.includes(p.id));
  
  // Calculate total hourly rate (sum of all assigned people's rates)
  const totalHourlyRate = assignedPeople.reduce((sum, person) => sum + (person.hourly_rate || 0), 0);
  const laborCost = estimatedDurationHours * totalHourlyRate;

  // Notify parent of labor cost changes
  useEffect(() => {
    if (onLaborCostChange && laborCost > 0) {
      onLaborCostChange(laborCost);
    }
  }, [laborCost, onLaborCostChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Labor Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assigned People Info */}
        {assignedPeople.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Assigned People ({assignedPeople.length})
            </Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {assignedPeople.map((person) => (
                <div key={person.id} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">
                    {person.first_name} {person.last_name}
                  </div>
                  {person.job_title && (
                    <div className="text-sm text-muted-foreground">{person.job_title}</div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Emp #: {person.employee_number}</span>
                    {person.hourly_rate && (
                      <span className="font-medium">${person.hourly_rate}/hr</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            No people assigned to this schedule
          </div>
        )}

        <Separator />

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
            <Label>Total Hourly Rate</Label>
            <Input
              type="number"
              value={totalHourlyRate.toFixed(2)}
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
          {assignedPeople.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Assign people to calculate labor cost
            </p>
          )}
          {assignedPeople.length > 0 && totalHourlyRate === 0 && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ No hourly rates set for assigned people
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
