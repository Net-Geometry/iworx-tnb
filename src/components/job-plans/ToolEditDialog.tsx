import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateJobPlanTool } from "@/hooks/useUpdateJobPlanTool";

interface Tool {
  id: string;
  tool_name: string;
  tool_description?: string;
  quantity_required?: number;
  notes?: string;
  is_specialized_tool?: boolean;
}

interface ToolEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
  jobPlanId: string;
}

/**
 * Dialog for editing an existing tool in a job plan
 */
export function ToolEditDialog({
  open,
  onOpenChange,
  tool,
  jobPlanId,
}: ToolEditDialogProps) {
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isSpecialized, setIsSpecialized] = useState(false);

  const updateTool = useUpdateJobPlanTool();

  useEffect(() => {
    if (tool) {
      setToolName(tool.tool_name);
      setToolDescription(tool.tool_description || "");
      setQuantity((tool.quantity_required || 1).toString());
      setNotes(tool.notes || "");
      setIsSpecialized(tool.is_specialized_tool || false);
    }
  }, [tool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tool || !toolName.trim()) return;

    updateTool.mutate(
      {
        id: tool.id,
        job_plan_id: jobPlanId,
        tool_name: toolName,
        tool_description: toolDescription || undefined,
        quantity_required: parseInt(quantity) || 1,
        notes: notes || undefined,
        is_specialized_tool: isSpecialized,
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
          <DialogTitle>Edit Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool-name">Tool Name *</Label>
            <Input
              id="tool-name"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="Enter tool name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tool-description">Description</Label>
            <Textarea
              id="tool-description"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              placeholder="Tool description..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Required</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
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
            <Label htmlFor="specialized">Specialized Tool</Label>
            <Switch
              id="specialized"
              checked={isSpecialized}
              onCheckedChange={setIsSpecialized}
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
            <Button type="submit" disabled={updateTool.isPending}>
              {updateTool.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
