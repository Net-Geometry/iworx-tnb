import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateJobPlanPart } from "@/hooks/useUpdateJobPlanPart";

interface Part {
  id: string;
  part_name: string;
  part_number?: string;
  quantity_required: number;
  notes?: string;
  is_critical_part?: boolean;
}

interface PartEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
  jobPlanId: string;
}

/**
 * Dialog for editing an existing part in a job plan
 */
export function PartEditDialog({
  open,
  onOpenChange,
  part,
  jobPlanId,
}: PartEditDialogProps) {
  const [partName, setPartName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isCritical, setIsCritical] = useState(false);

  const updatePart = useUpdateJobPlanPart();

  useEffect(() => {
    if (part) {
      setPartName(part.part_name);
      setPartNumber(part.part_number || "");
      setQuantity(part.quantity_required.toString());
      setNotes(part.notes || "");
      setIsCritical(part.is_critical_part || false);
    }
  }, [part]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!part || !partName.trim()) return;

    updatePart.mutate(
      {
        id: part.id,
        job_plan_id: jobPlanId,
        part_name: partName,
        part_number: partNumber || undefined,
        quantity_required: parseFloat(quantity) || 1,
        notes: notes || undefined,
        is_critical_part: isCritical,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
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
            <Button type="submit" disabled={updatePart.isPending}>
              {updatePart.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
