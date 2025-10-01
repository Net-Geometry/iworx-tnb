import { useState } from "react";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
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
import { ToolCreateDialog } from "./ToolCreateDialog";
import { ToolEditDialog } from "./ToolEditDialog";
import { useDeleteJobPlanTool } from "@/hooks/useDeleteJobPlanTool";

interface Tool {
  id: string;
  tool_name: string;
  tool_description?: string;
  quantity_required?: number;
  notes?: string;
  is_specialized_tool?: boolean;
}

interface InteractiveToolsListProps {
  tools: Tool[];
  jobPlanId: string;
  organizationId: string;
}

/**
 * Interactive tools list with add, edit, and delete functionality
 */
export function InteractiveToolsList({
  tools,
  jobPlanId,
  organizationId,
}: InteractiveToolsListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

  const deleteTool = useDeleteJobPlanTool();

  const handleEdit = (tool: Tool) => {
    setSelectedTool(tool);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (toolToDelete) {
      deleteTool.mutate({
        id: toolToDelete.id,
        job_plan_id: jobPlanId,
      });
      setDeleteDialogOpen(false);
      setToolToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tools Required</h3>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {tools.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <p>No tools added yet</p>
            <Button
              variant="link"
              onClick={() => setCreateDialogOpen(true)}
              className="mt-2"
            >
              Add your first tool
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.tool_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tool.tool_description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {tool.quantity_required || 1}
                  </TableCell>
                  <TableCell>
                    {tool.is_specialized_tool && (
                      <Badge variant="secondary" className="gap-1">
                        <Wrench className="w-3 h-3" />
                        Specialized
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tool)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(tool)}
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

      <ToolCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        jobPlanId={jobPlanId}
        organizationId={organizationId}
      />

      <ToolEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tool={selectedTool}
        jobPlanId={jobPlanId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{toolToDelete?.tool_name}"? This action
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
