import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Copy, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BOMForm } from "@/components/bom/BOMForm";
import { BOMItemsView } from "@/components/bom/BOMItemsView";
import { useBOMs, BOM } from "@/hooks/useBOMs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BOMDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteBOM, addBOM } = useBOMs();
  const { toast } = useToast();
  
  const [bom, setBom] = useState<BOM | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchBOM = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBom(data);
    } catch (error) {
      console.error('Failed to fetch BOM:', error);
      toast({
        title: "Error",
        description: "Failed to load BOM details",
        variant: "destructive",
      });
      navigate('/bom');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneBOM = async () => {
    if (!bom) return;
    
    try {
      const clonedBOM = {
        name: `${bom.name} (Copy)`,
        version: bom.version,
        description: bom.description,
        bom_type: bom.bom_type,
        status: 'draft' as const,
      };
      
      const newBOM = await addBOM(clonedBOM);
      toast({
        title: "Success",
        description: "BOM cloned successfully",
      });
      navigate(`/bom/${newBOM.id}`);
    } catch (error) {
      console.error('Failed to clone BOM:', error);
    }
  };

  const handleDeleteBOM = async () => {
    if (!bom) return;
    
    try {
      await deleteBOM(bom.id);
      navigate('/bom');
    } catch (error) {
      console.error('Failed to delete BOM:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'spare_parts': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    fetchBOM();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!bom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">BOM Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested BOM could not be found.</p>
            <Link to="/bom">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to BOM List
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/bom">Bill of Materials</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{bom.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{bom.name}</CardTitle>
              <p className="text-muted-foreground">Version {bom.version}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(bom.status)}>
                {bom.status}
              </Badge>
              <Badge className={getTypeColor(bom.bom_type)}>
                {bom.bom_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {bom.description || 'No description provided'}
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="ml-2">{new Date(bom.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="ml-2">{new Date(bom.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Actions</h3>
            <div className="flex gap-2">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit BOM</DialogTitle>
                  </DialogHeader>
                  <BOMForm 
                    bom={bom} 
                    onSuccess={() => {
                      setEditDialogOpen(false);
                      fetchBOM();
                    }} 
                  />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={handleCloneBOM}>
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete BOM</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this BOM? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBOM}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <BOMItemsView bomId={bom.id} />
    </div>
  );
};

export default BOMDetailPage;