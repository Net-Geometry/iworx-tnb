import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { usePMSchedule } from '@/hooks/usePMSchedules';
import { useJobPlan } from '@/hooks/useJobPlans';
import { usePMScheduleAssignments } from '@/hooks/usePMScheduleAssignments';
import { usePMScheduleMaterials } from '@/hooks/usePMScheduleMaterials';
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
  Package,
  ClipboardList,
  Shield,
  Users,
  HardHat,
  FileCheck,
  ExternalLink,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrderForm } from '@/components/work-orders/WorkOrderForm';
import { TestFormTab } from '@/components/work-orders/TestFormTab';
import { useAssetMeterGroups } from '@/hooks/useAssetMeterGroups';

import type { Database } from '@/integrations/supabase/types';

// Asset and Safety Precaution interfaces
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

type SafetyPrecaution = Database['public']['Tables']['safety_precautions']['Row'];

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
  const [safetyPrecautions, setSafetyPrecautions] = useState<SafetyPrecaution[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const workOrder = workOrders.find(wo => wo.id === id);
  
  // Fetch PM Schedule details if work order is linked to one
  const { data: pmSchedule } = usePMSchedule(workOrder?.pm_schedule_id || '');
  
  // Fetch job plan if PM schedule has one
  const { data: jobPlan } = useJobPlan(pmSchedule?.job_plan_id || '');
  
  // Fetch PM schedule assignments
  const { data: assignments } = usePMScheduleAssignments(workOrder?.pm_schedule_id);
  
  // Fetch PM schedule materials
  const { data: materials } = usePMScheduleMaterials(workOrder?.pm_schedule_id);
  
  // Fetch asset meter groups
  const { assetMeterGroups } = useAssetMeterGroups(workOrder?.asset_id);
  
  // Calculate matching meter groups between asset and job plan tasks
  const matchingMeterGroups = React.useMemo(() => {
    if (!assetMeterGroups || !jobPlan?.tasks) return [];
    
    const assetMeterGroupIds = assetMeterGroups.map(amg => amg.meter_group_id);
    const taskMeterGroupIds = jobPlan.tasks
      .filter(task => task.meter_group_id)
      .map(task => task.meter_group_id);
    
    const matchingIds = assetMeterGroupIds.filter(id => taskMeterGroupIds.includes(id));
    
    // Get full meter group details for matching IDs
    return assetMeterGroups
      .filter(amg => matchingIds.includes(amg.meter_group_id))
      .map(amg => ({
        id: amg.meter_group_id,
        name: (amg as any).meter_groups?.name || 'Unknown',
        group_number: (amg as any).meter_groups?.group_number,
        description: (amg as any).meter_groups?.description,
      }));
  }, [assetMeterGroups, jobPlan]);
  
  const showTestFormTab = matchingMeterGroups.length > 0;

  // Fetch related asset and safety precautions details
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

        // Fetch safety precautions if PM schedule has them
        if (pmSchedule?.safety_precaution_ids && pmSchedule.safety_precaution_ids.length > 0) {
          const { data: precautionsData, error: precautionsError } = await supabase
            .from('safety_precautions')
            .select('*')
            .in('id', pmSchedule.safety_precaution_ids);

          if (!precautionsError && precautionsData) {
            setSafetyPrecautions(precautionsData);
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [workOrder, pmSchedule]);

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
        <TabsList className={`grid w-full ${showTestFormTab ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="asset">Asset</TabsTrigger>
          <TabsTrigger value="pm-schedule">PM Schedule</TabsTrigger>
          {showTestFormTab && (
            <TabsTrigger value="test-form">
              <Zap className="h-4 w-4 mr-2" />
              Test Form
            </TabsTrigger>
          )}
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
        <TabsContent value="pm-schedule" className="space-y-6">
          {pmSchedule ? (
            <>
              {/* PM Schedule Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    PM Schedule Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Schedule Number</p>
                      <p className="font-medium">{pmSchedule.schedule_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{pmSchedule.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={
                        pmSchedule.status === 'active' ? 'default' : 
                        pmSchedule.status === 'paused' ? 'secondary' : 
                        'outline'
                      }>
                        {pmSchedule.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium">
                        Every {pmSchedule.frequency_value} {pmSchedule.frequency_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      {getPriorityBadge(pmSchedule.priority || 'medium')}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Due Date</p>
                      <p className="font-medium">{formatDate(pmSchedule.next_due_date)}</p>
                    </div>
                  </div>
                  {pmSchedule.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{pmSchedule.description}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/preventive-maintenance/edit/${pmSchedule.id}`)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Job Plan Details */}
              {jobPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Job Plan: {jobPlan.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Job Plan Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Job Plan Number</p>
                        <p className="font-medium">{jobPlan.job_plan_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge variant="outline">{jobPlan.job_type}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Duration</p>
                        <p className="font-medium">{jobPlan.estimated_duration_hours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Skill Level</p>
                        <Badge variant="secondary">{jobPlan.skill_level_required}</Badge>
                      </div>
                    </div>

                    {/* Tasks */}
                    {jobPlan.tasks && jobPlan.tasks.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Tasks ({jobPlan.tasks.length})
                        </h4>
                        <div className="space-y-2">
                          {jobPlan.tasks.sort((a, b) => a.task_sequence - b.task_sequence).map((task, idx) => (
                            <div key={task.id} className="border rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                                <div className="flex-1">
                                  <p className="font-medium">{task.task_title}</p>
                                  {task.task_description && (
                                    <p className="text-sm text-muted-foreground mt-1">{task.task_description}</p>
                                  )}
                                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                    {task.estimated_duration_minutes && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {task.estimated_duration_minutes} min
                                      </span>
                                    )}
                                    {task.skill_required && (
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {task.skill_required}
                                      </span>
                                    )}
                                    {task.is_critical_step && (
                                      <Badge variant="destructive" className="h-5">Critical</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tools */}
                    {jobPlan.tools && jobPlan.tools.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Required Tools ({jobPlan.tools.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {jobPlan.tools.map((tool) => (
                            <div key={tool.id} className="border rounded p-2 flex items-start gap-2">
                              <Wrench className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{tool.tool_name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {tool.quantity_required}</p>
                                {tool.is_specialized_tool && (
                                  <Badge variant="outline" className="mt-1 h-5 text-xs">Specialized</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Parts */}
                    {jobPlan.parts && jobPlan.parts.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Required Parts ({jobPlan.parts.length})
                        </h4>
                        <div className="space-y-2">
                          {jobPlan.parts.map((part) => (
                            <div key={part.id} className="border rounded p-3 flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{part.part_name}</p>
                                {part.part_number && (
                                  <p className="text-sm text-muted-foreground">PN: {part.part_number}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">Qty: {part.quantity_required}</p>
                              </div>
                              {part.is_critical_part && (
                                <Badge variant="destructive">Critical</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {jobPlan.documents && jobPlan.documents.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          Documents & Procedures ({jobPlan.documents.length})
                        </h4>
                        <div className="space-y-2">
                          {jobPlan.documents.map((doc) => (
                            <div key={doc.id} className="border rounded p-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{doc.document_name}</p>
                                  <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                                </div>
                              </div>
                              {doc.is_required && (
                                <Badge variant="outline">Required</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/job-plans?id=${jobPlan.id}`)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Complete Job Plan
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Safety Precautions */}
              {safetyPrecautions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Safety Precautions ({safetyPrecautions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {safetyPrecautions.map((precaution) => (
                        <div key={precaution.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <HardHat className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{precaution.precaution_code}</span>
                            </div>
                            <Badge variant={
                              precaution.severity_level === 'critical' ? 'destructive' :
                              precaution.severity_level === 'high' ? 'default' :
                              precaution.severity_level === 'medium' ? 'secondary' :
                              'outline'
                            }>
                              {precaution.severity_level}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{precaution.description}</p>
                          {precaution.required_actions && (
                            <div className="bg-muted/50 rounded p-2 mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Required Actions:</p>
                              <p className="text-sm">{precaution.required_actions}</p>
                            </div>
                          )}
                          <Badge variant="outline" className="mt-2">{precaution.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Personnel */}
              {assignments && assignments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Assigned Personnel ({assignments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between border rounded p-3">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {assignment.person?.first_name} {assignment.person?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {assignment.person?.job_title || 'Technician'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={assignment.assignment_role === 'primary' ? 'default' : 'secondary'}>
                            {assignment.assignment_role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Planned Materials */}
              {materials && materials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Planned Materials ({materials.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {materials.map((material) => (
                        <div key={material.id} className="border rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{material.bom_items?.item_name}</p>
                              {material.bom_items?.item_number && (
                                <p className="text-sm text-muted-foreground">
                                  Item #: {material.bom_items.item_number}
                                </p>
                              )}
                              <div className="flex gap-4 mt-2 text-sm">
                                <span>Qty: {material.planned_quantity}</span>
                                {material.estimated_unit_cost && (
                                  <span className="text-muted-foreground">
                                    Cost: {formatCurrency(Number(material.estimated_unit_cost) * Number(material.planned_quantity))}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total Material Cost:</span>
                          <span>
                            {formatCurrency(
                              materials.reduce((sum, m) => sum + (Number(m.estimated_unit_cost || 0) * Number(m.planned_quantity)), 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost Summary from Materials */}
              {materials && materials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Estimated Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material Cost:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            materials.reduce((sum, m) => sum + (Number(m.estimated_unit_cost || 0) * Number(m.planned_quantity)), 0)
                          )}
                        </span>
                      </div>
                      {pmSchedule.estimated_duration_hours && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Duration:</span>
                          <span className="font-medium">{pmSchedule.estimated_duration_hours} hours</span>
                        </div>
                      )}
                      {workOrder.estimated_cost && (
                        <>
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Work Order Budget:</span>
                            <span>{formatCurrency(workOrder.estimated_cost)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    This work order was not generated from a PM schedule
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Form Tab - Conditional */}
        {showTestFormTab && (
          <TabsContent value="test-form" className="space-y-4">
            <TestFormTab 
              workOrderId={workOrder.id}
              matchingMeterGroups={matchingMeterGroups}
            />
          </TabsContent>
        )}

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
