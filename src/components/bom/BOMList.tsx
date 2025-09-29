import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Copy, ArrowUpDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBOMs } from "@/hooks/useBOMs";
import { BOMForm } from "./BOMForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export const BOMList = () => {
  const { boms, loading, error, deleteBOM, addBOM } = useBOMs();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  const filteredAndSortedBOMs = boms
    .filter(bom =>
      bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a] || "";
      const bValue = b[sortField as keyof typeof b] || "";
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      case 'archived': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturing': return 'bg-primary text-primary-foreground';
      case 'maintenance': return 'bg-info text-info-foreground';
      case 'spare_parts': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteBOM(id);
    }
  };

  const handleClone = async (bom: any) => {
    const clonedBOM = {
      name: `${bom.name} (Copy)`,
      version: "1.0",
      description: bom.description,
      bom_type: bom.bom_type,
      status: "draft" as const
    };
    await addBOM(clonedBOM);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Bill of Materials</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your component lists and assembly structures
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create BOM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New BOM</DialogTitle>
                <DialogDescription>
                  Create a new bill of materials with component details
                </DialogDescription>
              </DialogHeader>
              <BOMForm onSuccess={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search BOMs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="text-destructive text-sm mb-4">
            Error loading BOMs: {error}
          </div>
        )}

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead>Version</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("bom_type")}
                >
                  <div className="flex items-center gap-1">
                    Type
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Created
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedBOMs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold mb-1">
                          {searchTerm ? "No BOMs match your search" : "No BOMs created yet"}
                        </h3>
                        {!searchTerm && (
                          <p className="text-sm">
                            Create your first bill of materials to get started
                          </p>
                        )}
                      </div>
                      {!searchTerm && (
                        <Button onClick={() => setShowCreateDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First BOM
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedBOMs.map((bom) => (
                  <TableRow key={bom.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{bom.name}</TableCell>
                    <TableCell>{bom.version}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(bom.bom_type)}>
                        {bom.bom_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(bom.status)}>
                        {bom.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {bom.description || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(bom.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/bom/${bom.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/bom/${bom.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit BOM
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClone(bom)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Clone BOM
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(bom.id, bom.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};