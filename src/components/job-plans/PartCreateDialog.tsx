import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateJobPlanPart } from "@/hooks/useCreateJobPlanPart";

interface PartCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPlanId: string;
  organizationId: string;
}

/**
 * Dialog for creating a new part for a job plan
 */
export function PartCreateDialog({
  open,
  onOpenChange,
  jobPlanId,
  organizationId,
}: PartCreateDialogProps) {
  const [partName, setPartName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isCritical, setIsCritical] = useState(false);

  const createPart = useCreateJobPlanPart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partName.trim()) return;

    createPart.mutate(
      {
        job_plan_id: jobPlanId,
        part_name: partName,
        part_number: partNumber || undefined,
        quantity_required: parseFloat(quantity) || 1,
        notes: notes || undefined,
        is_critical_part: isCritical,
        organization_id: organizationId,
      },
      {
        onSuccess: () => {
          // Reset form
          setPartName("");
          setPartNumber("");
          setQuantity("1");
          setNotes("");
          setIsCritical(false);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part-name">Part Name *</Label>
            <Input
              id="part-name"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Enter part name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-number">Part Number</Label>
            <Input
              id="part-number"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="Enter part number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Required</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="critical">Critical Part</Label>
            <Switch
              id="critical"
              checked={isCritical}
              onCheckedChange={setIsCritical}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPart.isPending}>
              {createPart.isPending ? "Adding..." : "Add Part"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
