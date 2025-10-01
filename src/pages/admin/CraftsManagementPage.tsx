import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCrafts } from "@/hooks/useCrafts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Crafts Management Page
 * Centralized location for managing organizational crafts
 */
const CraftsManagementPage = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const { crafts, isLoading, createCraft, updateCraft, deleteCraft } = useCrafts();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCraft, setEditingCraft] = useState<any>(null);
  const [deletingCraftId, setDeletingCraftId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });

  // Filter crafts based on search term
  const filteredCrafts = crafts.filter(
    (craft) =>
      craft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      craft.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });
    setEditingCraft(null);
  };

  // Handle edit button click
  const handleEdit = (craft: any) => {
    setEditingCraft(craft);
    setFormData({
      name: craft.name,
      code: craft.code || "",
      description: craft.description || "",
      is_active: craft.is_active ?? true,
    });
    setDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCraft) {
      await updateCraft.mutateAsync({ id: editingCraft.id, ...formData });
    } else {
      await createCraft.mutateAsync({
        ...formData,
        organization_id: currentOrganization?.id!,
      });
    }

    setDialogOpen(false);
    resetForm();
  };

  // Handle delete click
  const handleDeleteClick = (craftId: string) => {
    setDeletingCraftId(craftId);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (deletingCraftId) {
      await deleteCraft.mutateAsync(deletingCraftId);
      setDeleteDialogOpen(false);
      setDeletingCraftId(null);
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/reference-data")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reference Data
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Crafts Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage craft types and specializations for labor management
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Craft
          </Button>
        </div>
      </div>

      {/* Search Control */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crafts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Crafts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCrafts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No crafts found
                </TableCell>
              </TableRow>
            ) : (
              filteredCrafts.map((craft) => (
                <TableRow key={craft.id}>
                  <TableCell className="font-medium">{craft.code || "-"}</TableCell>
                  <TableCell>{craft.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {craft.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={craft.is_active ? "default" : "secondary"}>
                      {craft.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(craft)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(craft.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCraft ? "Edit Craft" : "Add New Craft"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Craft Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              {editingCraft ? "Update Craft" : "Create Craft"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this craft. This action cannot be undone.
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
};

export default CraftsManagementPage;
