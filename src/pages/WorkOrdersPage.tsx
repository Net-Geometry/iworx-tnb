import { useState } from "react";
import { Wrench, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkOrders, WorkOrder } from "@/hooks/useWorkOrders";
import { WorkOrderKPICards } from "@/components/work-orders/WorkOrderKPICards";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderDetailsModal } from "@/components/work-orders/WorkOrderDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WorkOrdersPage = () => {
  const { workOrders, stats, loading, createWorkOrder, updateWorkOrder, deleteWorkOrder, refetch } = useWorkOrders();
  
  // State for dialogs and modals
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch = wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
    const matchesType = typeFilter === "all" || wo.maintenance_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleCreateWorkOrder = async (values: any) => {
    await createWorkOrder(values);
    setShowCreateDialog(false);
  };

  const handleUpdateWorkOrder = async (values: any) => {
    if (selectedWorkOrder) {
      await updateWorkOrder(selectedWorkOrder.id, values);
      setShowEditDialog(false);
      setSelectedWorkOrder(null);
    }
  };

  const handleDeleteWorkOrder = async (id: string) => {
    if (confirm("Are you sure you want to delete this work order?")) {
      await deleteWorkOrder(id);
    }
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Work Management</h1>
            <p className="text-muted-foreground">
              Manage work orders, track progress, and optimize execution
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Work Order
        </Button>
      </div>

      {/* KPI Cards */}
      <WorkOrderKPICards stats={stats} loading={loading} />

      {/* Filters and Search */}
      <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
              <SelectItem value="predictive">Predictive</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Work Orders Table */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/50">
                <WorkOrderTable
                  workOrders={filteredWorkOrders}
                  onView={() => {}} // No longer used, navigation happens in table
                  onEdit={handleEditWorkOrder}
                  onDelete={handleDeleteWorkOrder}
                />
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/50">
            <p className="text-center text-muted-foreground py-12">
              Calendar view coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Work Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Work Order</DialogTitle>
          </DialogHeader>
          <WorkOrderForm
            onSubmit={handleCreateWorkOrder}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Work Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
          </DialogHeader>
          <WorkOrderForm
            workOrder={selectedWorkOrder || undefined}
            onSubmit={handleUpdateWorkOrder}
            onCancel={() => {
              setShowEditDialog(false);
              setSelectedWorkOrder(null);
            }}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default WorkOrdersPage;
