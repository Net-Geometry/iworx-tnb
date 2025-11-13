import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrafts } from "@/hooks/useCrafts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

/**
 * Crafts Management Page
 * Comprehensive management interface for organizational crafts with skill levels, vendors, and contracts
 */
const CraftsManagementPage = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const { crafts, isLoading, createCraft, updateCraft, deleteCraft } = useCrafts();
  const { data: suppliers } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCraft, setEditingCraft] = useState<any>(null);
  const [deletingCraft, setDeletingCraft] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    contract: "",
    description: "",
    skill_level: "",
    vendor_id: "",
    rate: "",
  });

  // Filter crafts based on search term
  const filteredCrafts = crafts.filter((craft) =>
    craft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    craft.contract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    craft.skill_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    craft.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit button click
  const handleEdit = (craft: any) => {
    setEditingCraft(craft);
    setFormData({
      name: craft.name,
      contract: craft.contract || "",
      description: craft.description || "",
      skill_level: craft.skill_level || "",
      vendor_id: craft.vendor_id || "",
      rate: craft.rate?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Craft name is required");
      return;
    }

    try {
      const rateValue = formData.rate ? parseFloat(formData.rate) : null;
      
      if (editingCraft) {
        await updateCraft.mutateAsync({
          id: editingCraft.id,
          ...formData,
          contract: formData.contract || null,
          skill_level: formData.skill_level || null,
          vendor_id: formData.vendor_id || null,
          rate: rateValue,
        });
      } else {
        await createCraft.mutateAsync({
          name: formData.name,
          contract: formData.contract || null,
          description: formData.description || null,
          skill_level: formData.skill_level || null,
          vendor_id: formData.vendor_id || null,
          rate: rateValue,
          organization_id: currentOrganization?.id || "",
          is_active: true,
        });
      }
      setIsDialogOpen(false);
      setEditingCraft(null);
      setFormData({ name: "", contract: "", description: "", skill_level: "", vendor_id: "", rate: "" });
    } catch (error) {
      console.error("Error saving craft:", error);
    }
  };

  // Handle delete click
  const handleDeleteClick = (craft: any) => {
    setDeletingCraft(craft);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (deletingCraft) {
      await deleteCraft.mutateAsync(deletingCraft.id);
      setIsDeleteDialogOpen(false);
      setDeletingCraft(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/people-labor")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to People & Labor
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Crafts Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage craft types, skill levels, rates, vendors, and contracts for labor management
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Craft
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crafts by name, contract, skill level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Crafts Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading crafts...</div>
        ) : filteredCrafts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? "No crafts found matching your search" : "No crafts yet. Add your first craft to get started."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Skill Level</TableHead>
                <TableHead>Rate (RM/hr)</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCrafts.map((craft) => {
                const vendor = suppliers?.find(s => s.id === craft.vendor_id);
                return (
                  <TableRow key={craft.id}>
                    <TableCell className="font-medium">{craft.name}</TableCell>
                    <TableCell>{craft.skill_level || "-"}</TableCell>
                    <TableCell>{craft.rate ? `RM ${craft.rate.toFixed(2)}` : "-"}</TableCell>
                    <TableCell>{vendor?.name || "-"}</TableCell>
                    <TableCell>{craft.contract || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{craft.description || "-"}</TableCell>
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
                          onClick={() => handleDeleteClick(craft)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCraft ? "Edit Craft" : "Add New Craft"}</DialogTitle>
            <DialogDescription>
              {editingCraft ? "Edit craft details" : "Add a new craft to your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Craft Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Electrician"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill_level">Skill Level</Label>
                <Input
                  id="skill_level"
                  placeholder="e.g., TD 03-04, TT 05-06"
                  value={formData.skill_level}
                  onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate (RM)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 45.50"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract">Contract</Label>
                <Input
                  id="contract"
                  placeholder="e.g., CONTRACT-2024"
                  value={formData.contract}
                  onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor (Optional)</Label>
              <Select
                value={formData.vendor_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter craft description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCraft ? "Update Craft" : "Add Craft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the craft "{deletingCraft?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
