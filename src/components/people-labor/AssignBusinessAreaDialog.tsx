import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessAreas } from "@/hooks/useBusinessAreas";
import { useAssignBusinessArea, PersonBusinessArea } from "@/hooks/usePersonBusinessAreas";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface AssignBusinessAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  existingAssignments: PersonBusinessArea[];
}

/**
 * Dialog for assigning business areas to a person
 * Allows selecting a business area and marking it as primary
 */
export function AssignBusinessAreaDialog({
  open,
  onOpenChange,
  personId,
  existingAssignments,
}: AssignBusinessAreaDialogProps) {
  const { data: businessAreas, isLoading: businessAreasLoading } = useBusinessAreas();
  const assignBusinessArea = useAssignBusinessArea();
  
  const [selectedBusinessAreaId, setSelectedBusinessAreaId] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState(false);

  // Filter out already assigned business areas
  const availableBusinessAreas = businessAreas?.filter(
    (ba) => !existingAssignments.some((assignment) => assignment.business_area_id === ba.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusinessAreaId) return;

    try {
      await assignBusinessArea.mutateAsync({
        person_id: personId,
        business_area_id: selectedBusinessAreaId,
        is_primary: isPrimary,
      });

      // Reset form
      setSelectedBusinessAreaId("");
      setIsPrimary(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning business area:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Business Area</DialogTitle>
          <DialogDescription>
            Assign a business area to this person. You can mark it as primary.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-area">Business Area *</Label>
            <Select
              value={selectedBusinessAreaId}
              onValueChange={setSelectedBusinessAreaId}
              disabled={businessAreasLoading}
            >
              <SelectTrigger id="business-area">
                <SelectValue placeholder="Select a business area" />
              </SelectTrigger>
              <SelectContent>
                {availableBusinessAreas?.map((ba) => (
                  <SelectItem key={ba.id} value={ba.id}>
                    {ba.business_area || "Unnamed Business Area"} 
                    {ba.station && ` - ${ba.station}`}
                  </SelectItem>
                ))}
                {availableBusinessAreas?.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    All business areas already assigned
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-primary"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
            />
            <Label
              htmlFor="is-primary"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as primary business area
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignBusinessArea.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedBusinessAreaId || assignBusinessArea.isPending}
            >
              {assignBusinessArea.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign Business Area
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
