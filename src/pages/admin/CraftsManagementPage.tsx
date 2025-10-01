import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
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
  DialogTrigger,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";

/**
 * CraftsManagementPage - Admin page for managing organizational crafts/teams
 * 
 * This page allows administrators to:
 * - View all crafts in the organization
 * - Create new crafts
 * - Edit existing crafts
 * - Delete crafts
 * - Search and filter crafts
 */
const CraftsManagementPage = () => {
  const { crafts, isLoading, createCraft, updateCraft, deleteCraft } = useCrafts();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCraft, setEditingCraft] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [craftToDelete, setCraftToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });

  // Filter crafts based on search term
  const filteredCrafts = crafts.filter((craft) => {
    const matchesSearch = 
      craft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (craft.code && craft.code.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });
    setEditingCraft(null);
  };

  // Handle opening dialog for editing
  const handleEdit = (craft: any) => {
    setEditingCraft(craft);
    setFormData({
      name: craft.name,
      code: craft.code || "",
      description: craft.description || "",
      is_active: craft.is_active ?? true,
    });
    setOpen(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCraft) {
      await updateCraft.mutateAsync({
        id: editingCraft.id,
        ...formData,
      });
    } else {
      await createCraft.mutateAsync(formData as any);
    }
    
    setOpen(false);
    resetForm();
  };

  // Handle delete confirmation
  const handleDeleteClick = (craftId: string) => {
    setCraftToDelete(craftId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete action
  const handleDeleteConfirm = async () => {
    if (craftToDelete) {
      await deleteCraft.mutateAsync(craftToDelete);
      setDeleteDialogOpen(false);
      setCraftToDelete(null);
    }
  };

  // Handle dialog close
  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Crafts Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizational crafts, teams, and job classifications
          </p>
        </div>
        
        {/* Add Craft Dialog */}
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Craft
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCraft ? "Edit Craft" : "Add New Craft"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Craft Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electrician, Civil Technician"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Craft Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., ELCTCIAN, CIVILADT"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this craft and its responsibilities"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Status</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCraft ? "Update Craft" : "Create Craft"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crafts by name or code..."
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
              <TableHead>Craft Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading crafts...
                </TableCell>
              </TableRow>
            ) : filteredCrafts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No crafts found. Add your first craft to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredCrafts.map((craft) => (
                <TableRow key={craft.id}>
                  <TableCell className="font-medium">
                    {craft.code || "-"}
                  </TableCell>
                  <TableCell className="font-semibold">{craft.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {craft.description || "-"}
                  </TableCell>
                  <TableCell>
                    {craft.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(craft)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(craft.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this craft. This action cannot be undone.
              People assigned to this craft will lose their craft assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCraftToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CraftsManagementPage;
