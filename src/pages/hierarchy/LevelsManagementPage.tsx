import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Layers } from "lucide-react";
import { useHierarchyLevels } from "@/hooks/useHierarchyData";
import { DraggableLevelList } from "@/components/hierarchy/levels/DraggableLevelList";
import { LevelManagementForm } from "@/components/assets/LevelManagementForm";
import { useToast } from "@/hooks/use-toast";
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

/**
 * LevelsManagementPage
 * 
 * Dedicated page for managing hierarchy levels with drag-and-drop reordering,
 * inline editing, and level configuration.
 */

const LevelsManagementPage = () => {
  const { levels, loading, updateLevel, deleteLevel, refetch } = useHierarchyLevels();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [deletingLevelId, setDeletingLevelId] = useState<string | null>(null);

  const handleReorder = async (reorderedLevels: any[]) => {
    try {
      // Update all levels with new order
      await Promise.all(
        reorderedLevels.map((level) =>
          updateLevel(level.id, { level_order: level.level_order })
        )
      );
      
      toast({
        title: "Levels Reordered",
        description: "Hierarchy levels have been successfully reordered.",
      });
      
      await refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder levels. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (levelId: string) => {
    setEditingLevelId(levelId);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingLevelId) return;

    try {
      await deleteLevel(deletingLevelId);
      toast({
        title: "Level Deleted",
        description: "Hierarchy level has been successfully deleted.",
      });
      setDeletingLevelId(null);
      await refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete level. It may be in use by existing nodes.",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLevelId(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link to="/assets/hierarchy">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Hierarchy Levels Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure hierarchy levels and their order. Drag to reorder.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Level
        </Button>
      </div>

      {/* Levels List */}
      {levels.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Levels Defined</h3>
          <p className="text-muted-foreground mb-4">
            Create your first hierarchy level to get started
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Level
          </Button>
        </div>
      ) : (
        <DraggableLevelList
          levels={levels}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={(id) => setDeletingLevelId(id)}
        />
      )}

      {/* Level Form Dialog */}
      {showForm && (
        <LevelManagementForm
          levelId={editingLevelId || undefined}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLevelId} onOpenChange={() => setDeletingLevelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hierarchy Level?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hierarchy level
              and may affect existing nodes using this level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LevelsManagementPage;
