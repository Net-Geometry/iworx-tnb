import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrafts } from "@/hooks/useCrafts";
import { usePersonCrafts, PersonCraft } from "@/hooks/usePersonCrafts";
import { toast } from "sonner";

interface AssignCraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  editingCraft?: PersonCraft | null;
}

/**
 * Dialog for assigning or editing a craft for a person
 */
export function AssignCraftDialog({ open, onOpenChange, personId, editingCraft }: AssignCraftDialogProps) {
  const { crafts, isLoading: craftsLoading } = useCrafts();
  const { addPersonCraft, updatePersonCraft } = usePersonCrafts(personId);
  
  const [formData, setFormData] = useState({
    craft_id: editingCraft?.craft_id || "",
    proficiency_level: editingCraft?.proficiency_level || "beginner",
    certification_status: editingCraft?.certification_status || "none",
    assigned_date: editingCraft?.assigned_date || new Date().toISOString().split('T')[0],
    notes: editingCraft?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.craft_id) {
      toast.error("Please select a craft");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data with proper null handling for dates
      const submitData = {
        ...formData,
        assigned_date: formData.assigned_date || null,
      };

      if (editingCraft) {
        await updatePersonCraft.mutateAsync({
          id: editingCraft.id,
          ...submitData,
        });
      } else {
        await addPersonCraft.mutateAsync({
          person_id: personId,
          ...submitData,
        } as any);
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving craft:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      craft_id: "",
      proficiency_level: "beginner",
      certification_status: "none",
      assigned_date: new Date().toISOString().split('T')[0],
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCraft ? "Edit Craft" : "Assign Craft"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="craft">Craft *</Label>
            <Select
              value={formData.craft_id}
              onValueChange={(value) => setFormData({ ...formData, craft_id: value })}
              disabled={!!editingCraft || craftsLoading}
            >
              <SelectTrigger id="craft">
                <SelectValue placeholder="Select a craft" />
              </SelectTrigger>
              <SelectContent>
                {crafts.map((craft) => (
                  <SelectItem key={craft.id} value={craft.id}>
                    {craft.name} {craft.code && `(${craft.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level *</Label>
            <Select
              value={formData.proficiency_level}
              onValueChange={(value) => setFormData({ ...formData, proficiency_level: value })}
            >
              <SelectTrigger id="proficiency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certification">Certification Status *</Label>
            <Select
              value={formData.certification_status}
              onValueChange={(value) => setFormData({ ...formData, certification_status: value })}
            >
              <SelectTrigger id="certification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="certified">Certified</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-date">Assigned Date</Label>
            <Input
              id="assigned-date"
              type="date"
              value={formData.assigned_date}
              onChange={(e) => setFormData({ ...formData, assigned_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this craft assignment..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingCraft ? "Update" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
