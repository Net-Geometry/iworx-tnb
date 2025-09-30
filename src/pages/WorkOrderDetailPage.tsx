import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Calendar,
  DollarSign,
  User,
  Clock,
  AlertTriangle,
  Wrench,
  FileText,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrderForm } from '@/components/work-orders/WorkOrderForm';

// Asset and PM Schedule interfaces
interface Asset {
  id: string;
  name: string;
  asset_number?: string;
  status?: string;
  type?: string;
  hierarchy_nodes?: {
    name: string;
    path?: string;
  };
}

interface PMSchedule {
  id: string;
  title: string;
  frequency_type?: string;
  frequency_value?: number;
  status?: string;
}

/**
 * WorkOrderDetailPage - Dedicated page for viewing work order details
 * Displays comprehensive information about a work order including asset integration,
 * PM schedule connection, and quick actions
 */
const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workOrders, loading, updateWorkOrder } = useWorkOrders();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [pmSchedule, setPMSchedule] = useState<PMSchedule | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const workOrder = workOrders.find(wo => wo.id === id);

  // Fetch related asset and PM schedule details
  React.useEffect(() => {
    const fetchDetails = async () => {
      if (!workOrder) return;
      
      setLoadingDetails(true);
      try {
        // Fetch asset details if asset_id exists
        if (workOrder.asset_id) {
          const { data: assetData, error: assetError } = await supabase
            .from('assets')
            .select('id, name, asset_number, status, type, hierarchy_nodes(name, path)')
            .eq('id', workOrder.asset_id)
            .single();

          if (!assetError && assetData) {
            setAsset(assetData);
          }
        }

        // Fetch PM schedule details if pm_schedule_id exists
        if (workOrder.pm_schedule_id) {
          const { data: pmData, error: pmError } = await supabase
            .from('pm_schedules')
            .select('id, title, frequency_type, frequency_value, status')
            .eq('id', workOrder.pm_schedule_id)
            .single();

          if (!pmError && pmData) {
            setPMSchedule(pmData);
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [workOrder]);

  // Handle status update
  const handleStatusUpdate = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    if (!workOrder) return;

    setUpdatingStatus(true);
    try {
      await updateWorkOrder(workOrder.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Work order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle edit work order
  const handleEditWorkOrder = async (data: any) => {
    if (!workOrder) return;

    try {
      await updateWorkOrder(workOrder.id, data);
      setShowEditDialog(false);
      toast({
        title: "Success",
        description: "Work order updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Work Order Not Found</h1>
          <p className="text-muted-foreground">The work order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/work-orders')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    return amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : 'N/A';
  };

  const formatDate = (date?: string) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  const formatDateTime = (date?: string) => {
    return date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pending': 'outline',
      'in_progress': 'default',
      'completed': 'secondary',
      'cancelled': 'destructive',
    };
    return <Badge variant={variants[status || 'pending'] || 'outline'}>{status?.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return <Badge className={colors[priority || 'medium']}>{priority}</Badge>;
  };

  const getMaintenanceTypeBadge = (type?: string) => {
    const colors: Record<string, string> = {
      'preventive': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'corrective': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'predictive': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'emergency': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return <Badge className={colors[type || 'preventive']}>{type?.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/work-orders">Work Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{workOrder.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/work-orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Work Orders
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{workOrder.title}</h1>
          <p className="text-lg text-muted-foreground">Work Order #{workOrder.id.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={workOrder.status} 
            onValueChange={handleStatusUpdate}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setShowEditDialog(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Work Order Overview Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Status & Priority */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(workOrder.status)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <div className="mt-1">
                  {getPriorityBadge(workOrder.priority)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Maintenance Type</label>
                <div className="mt-1">
                  {getMaintenanceTypeBadge(workOrder.maintenance_type)}
                </div>
              </div>

              {workOrder.generation_type && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Generated From</label>
                  <div className="mt-1">
                    <Badge variant="outline">{workOrder.generation_type}</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule & Assignment */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Scheduled Date
                </label>
                <p className="text-sm text-foreground mt-1">{formatDate(workOrder.scheduled_date)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Assigned To
                </label>
                <p className="text-sm text-foreground mt-1">{workOrder.assigned_technician || 'Unassigned'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Estimated Duration
                </label>
                <p className="text-sm text-foreground mt-1">
                  {workOrder.estimated_duration_hours ? `${workOrder.estimated_duration_hours} hours` : 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Actual Duration
                </label>
                <p className="text-sm text-foreground mt-1">N/A</p>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Estimated Cost
                </label>
                <p className="text-sm text-foreground mt-1">{formatCurrency(workOrder.estimated_cost)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Actual Cost
                </label>
                <p className="text-sm text-foreground mt-1">N/A</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm text-foreground mt-1">{formatDateTime(workOrder.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-sm text-foreground mt-1">{formatDateTime(workOrder.updated_at)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="sm" variant="outline">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
              
              <Button variant="outline" className="w-full" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Add Notes
              </Button>
              
              <Button variant="outline" className="w-full" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Add Materials
              </Button>
              
              <Button variant="outline" className="w-full" size="sm" disabled>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="asset">Asset</TabsTrigger>
          <TabsTrigger value="pm-schedule">PM Schedule</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Work Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-foreground mt-1">{workOrder.description || 'No description provided'}</p>
              </div>
              
              <Separator />
              
              {workOrder.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm text-foreground mt-1">{workOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Tab */}
        <TabsContent value="asset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Related Asset
              </CardTitle>
              <CardDescription>Asset information for this work order</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDetails ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : asset ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
                        <p className="text-sm text-foreground mt-1 font-medium">{asset.name}</p>
                      </div>
                      
                      {asset.asset_number && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Asset Number</label>
                          <p className="text-sm text-foreground mt-1">{asset.asset_number}</p>
                        </div>
                      )}
                      
                      {asset.type && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <p className="text-sm text-foreground mt-1">{asset.type}</p>
                        </div>
                      )}
                      
                      {asset.status && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">
                            <Badge variant="outline">{asset.status}</Badge>
                          </div>
                        </div>
                      )}

                      {asset.hierarchy_nodes && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="text-sm text-foreground mt-1">{asset.hierarchy_nodes.path || asset.hierarchy_nodes.name}</p>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/assets/${asset.id}`)}
                    >
                      View Asset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No asset linked to this work order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PM Schedule Tab */}
        <TabsContent value="pm-schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                PM Schedule
              </CardTitle>
              <CardDescription>Preventive maintenance schedule information</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDetails ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : pmSchedule ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Schedule Title</label>
                        <p className="text-sm text-foreground mt-1 font-medium">{pmSchedule.title}</p>
                      </div>
                      
                      {pmSchedule.frequency_type && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                          <p className="text-sm text-foreground mt-1">
                            {pmSchedule.frequency_type} 
                            {pmSchedule.frequency_value && ` - Every ${pmSchedule.frequency_value} ${pmSchedule.frequency_type}`}
                          </p>
                        </div>
                      )}
                      
                      {pmSchedule.status && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">
                            <Badge variant="outline">{pmSchedule.status}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/preventive-maintenance/edit/${pmSchedule.id}`)}
                    >
                      View Schedule
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">This work order was not generated from a PM schedule</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks & Notes Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Notes</CardTitle>
              <CardDescription>Work instructions and completion notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Task management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Status changes and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Activity history coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
          </DialogHeader>
          <WorkOrderForm
            workOrder={workOrder}
            onSubmit={handleEditWorkOrder}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrderDetailPage;
