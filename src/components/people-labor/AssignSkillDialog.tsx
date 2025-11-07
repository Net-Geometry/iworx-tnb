import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSkills } from "@/hooks/useSkills";
import { usePersonSkills, PersonSkill } from "@/hooks/usePersonSkills";
import { toast } from "sonner";

interface AssignSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  editingSkill?: PersonSkill | null;
}

/**
 * Dialog for assigning or editing a skill for a person
 */
export function AssignSkillDialog({ open, onOpenChange, personId, editingSkill }: AssignSkillDialogProps) {
  const { skills, isLoading: skillsLoading } = useSkills();
  const { assignSkill, updatePersonSkill } = usePersonSkills(personId);
  
  const [formData, setFormData] = useState({
    skill_id: editingSkill?.skill_id || "",
    proficiency_level: editingSkill?.proficiency_level || "beginner",
    years_of_experience: editingSkill?.years_of_experience || 0,
    certified: editingSkill?.certified || false,
    certification_date: editingSkill?.certification_date || "",
    certification_expiry: editingSkill?.certification_expiry || "",
    notes: editingSkill?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.skill_id) {
      toast.error("Please select a skill");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data with proper null handling for dates
      const submitData = {
        ...formData,
        certification_date: formData.certification_date || null,
        certification_expiry: formData.certification_expiry || null,
      };

      if (editingSkill) {
        await updatePersonSkill.mutateAsync({
          id: editingSkill.id,
          ...submitData,
        });
      } else {
        await assignSkill.mutateAsync({
          person_id: personId,
          ...submitData,
        });
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving skill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      skill_id: "",
      proficiency_level: "beginner",
      years_of_experience: 0,
      certified: false,
      certification_date: "",
      certification_expiry: "",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingSkill ? "Edit Skill" : "Assign Skill"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill">Skill *</Label>
            <Select
              value={formData.skill_id}
              onValueChange={(value) => setFormData({ ...formData, skill_id: value })}
              disabled={!!editingSkill || skillsLoading}
            >
              <SelectTrigger id="skill">
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.skill_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level *</Label>
            <Select
              value={formData.proficiency_level}
              onValueChange={(value) => setFormData({ ...formData, proficiency_level: value as any })}
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
            <Label htmlFor="years">Years of Experience</Label>
            <Input
              id="years"
              type="number"
              min="0"
              value={formData.years_of_experience}
              onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="certified"
              checked={formData.certified}
              onCheckedChange={(checked) => setFormData({ ...formData, certified: checked })}
            />
            <Label htmlFor="certified">Certified</Label>
          </div>

          {formData.certified && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cert-date">Certification Date</Label>
                <Input
                  id="cert-date"
                  type="date"
                  value={formData.certification_date}
                  onChange={(e) => setFormData({ ...formData, certification_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert-expiry">Certification Expiry</Label>
                <Input
                  id="cert-expiry"
                  type="date"
                  value={formData.certification_expiry}
                  onChange={(e) => setFormData({ ...formData, certification_expiry: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this skill..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingSkill ? "Update" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
