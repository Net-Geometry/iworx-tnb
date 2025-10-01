import { useState } from "react";
import { useAssetSkillRequirements } from "@/hooks/useAssetSkillRequirements";
import { useSkills } from "@/hooks/useSkills";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssetSkillRequirementsTabProps {
  assetId: string;
}

/**
 * Component to manage skill requirements for an asset
 * Allows adding, editing, and removing skills needed for asset maintenance
 */
export const AssetSkillRequirementsTab = ({ assetId }: AssetSkillRequirementsTabProps) => {
  const { assetSkillRequirements, isLoading, addSkillRequirement, deleteSkillRequirement, updateSkillRequirement } = useAssetSkillRequirements(assetId);
  const { skills } = useSkills();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [proficiencyLevel, setProficiencyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [isMandatory, setIsMandatory] = useState(true);
  const [priorityOrder, setPriorityOrder] = useState(1);

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;

    await addSkillRequirement.mutateAsync({
      asset_id: assetId,
      skill_id: selectedSkillId,
      proficiency_level_required: proficiencyLevel,
      is_mandatory: isMandatory,
      priority_order: priorityOrder,
    });

    setIsAddDialogOpen(false);
    setSelectedSkillId("");
    setProficiencyLevel('intermediate');
    setIsMandatory(true);
    setPriorityOrder(1);
  };

  const handleDeleteSkill = async (skillRequirementId: string) => {
    if (confirm("Are you sure you want to remove this skill requirement?")) {
      await deleteSkillRequirement.mutateAsync(skillRequirementId);
    }
  };

  const availableSkills = skills.filter(
    skill => !assetSkillRequirements.some(req => req.skill_id === skill.id)
  );

  const getProficiencyBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading skill requirements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Required Skills</h3>
          <p className="text-sm text-muted-foreground">
            Define the skills needed to maintain and repair this asset
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Skill Requirement
        </Button>
      </div>

      {/* Info Alert */}
      {assetSkillRequirements.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No skill requirements defined yet. Add skills to help match qualified technicians for work orders.
          </AlertDescription>
        </Alert>
      )}

      {/* Skills Table */}
      {assetSkillRequirements.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required Level</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetSkillRequirements.map((requirement) => (
                <TableRow key={requirement.id}>
                  <TableCell className="font-medium">
                    {requirement.priority_order}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{requirement.skills?.skill_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {requirement.skills?.skill_code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {requirement.skills?.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getProficiencyBadgeColor(requirement.proficiency_level_required)}>
                      {requirement.proficiency_level_required}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {requirement.is_mandatory ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSkill(requirement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill Requirement</DialogTitle>
            <DialogDescription>
              Select a skill and define the proficiency level required to work on this asset.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Skill Selection */}
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.skill_name} ({skill.skill_code}) - {skill.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Proficiency Level */}
            <div className="space-y-2">
              <Label>Required Proficiency Level</Label>
              <Select value={proficiencyLevel} onValueChange={(value: any) => setProficiencyLevel(value)}>
                <SelectTrigger>
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

            {/* Priority Order */}
            <div className="space-y-2">
              <Label>Priority Order</Label>
              <Select value={priorityOrder.toString()} onValueChange={(value) => setPriorityOrder(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mandatory Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="mandatory">Mandatory Skill</Label>
              <Switch
                id="mandatory"
                checked={isMandatory}
                onCheckedChange={setIsMandatory}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={!selectedSkillId}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};