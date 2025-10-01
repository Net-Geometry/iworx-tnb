import { useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PartCreateDialog } from "./PartCreateDialog";
import { PartEditDialog } from "./PartEditDialog";
import { useDeleteJobPlanPart } from "@/hooks/useDeleteJobPlanPart";

interface Part {
  id: string;
  part_name: string;
  part_number?: string;
  quantity_required: number;
  notes?: string;
  is_critical_part?: boolean;
}

interface InteractivePartsListProps {
  parts: Part[];
  jobPlanId: string;
  organizationId: string;
}

/**
 * Interactive parts list with add, edit, and delete functionality
 */
export function InteractivePartsList({
  parts,
  jobPlanId,
  organizationId,
}: InteractivePartsListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<Part | null>(null);

  const deletePart = useDeleteJobPlanPart();

  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (part: Part) => {
    setPartToDelete(part);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (partToDelete) {
      deletePart.mutate({
        id: partToDelete.id,
        job_plan_id: jobPlanId,
      });
      setDeleteDialogOpen(false);
      setPartToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Parts Required</h3>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Part
        </Button>
      </div>

      {parts.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <p>No parts added yet</p>
            <Button
              variant="link"
              onClick={() => setCreateDialogOpen(true)}
              className="mt-2"
            >
              Add your first part
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.part_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {part.part_number || "—"}
                  </TableCell>
                  <TableCell className="text-right">{part.quantity_required}</TableCell>
                  <TableCell>
                    {part.is_critical_part && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Critical
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(part)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(part)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <PartCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        jobPlanId={jobPlanId}
        organizationId={organizationId}
      />

      <PartEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        part={selectedPart}
        jobPlanId={jobPlanId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{partToDelete?.part_name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
