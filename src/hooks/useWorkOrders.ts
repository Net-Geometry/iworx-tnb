import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { workOrderApi } from '@/services/api-client';
import { useWorkflowTemplateInitializer } from '@/hooks/useWorkflowTemplateInitializer';

export interface WorkOrder {
  id: string;
  asset_id: string;
  title: string;
  description?: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduled_date: string;
  estimated_duration_hours?: number;
  assigned_technician?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  estimated_cost?: number;
  notes?: string;
  organization_id: string;
  pm_schedule_id?: string;
  incident_report_id?: string;
  generation_type?: 'manual' | 'automatic';
  created_at: string;
  updated_at: string;
  target_start_date?: string;
  target_finish_date?: string;
  actual_start_date?: string;
  actual_finish_date?: string;
}

export interface WorkOrderStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

export const useWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [stats, setStats] = useState<WorkOrderStats>({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const { mutateAsync: initializeWorkflow } = useWorkflowTemplateInitializer();

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      
      // Try microservice first
      try {
        const data = await workOrderApi.getWorkOrders() as any[];
        const stats = await workOrderApi.getWorkOrderStats() as WorkOrderStats;
        
        const typedData: WorkOrder[] = (data || []).map((order: any) => ({
          ...order,
          maintenance_type: order.maintenance_type as WorkOrder['maintenance_type'],
          priority: order.priority as WorkOrder['priority'],
          status: order.status as WorkOrder['status'],
          generation_type: order.generation_type as WorkOrder['generation_type']
        }));

        setWorkOrders(typedData);
        setStats(stats);
        console.log('[useWorkOrders] Loaded via microservice');
        return;
      } catch (microserviceError) {
        console.warn('[useWorkOrders] Microservice failed, falling back to direct DB access:', microserviceError);
      }

      // Fallback to direct Supabase access
      let query = supabase
        .from('work_orders')
        .select('*');

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;

      const typedData: WorkOrder[] = (data || []).map(order => ({
        ...order,
        maintenance_type: order.maintenance_type as WorkOrder['maintenance_type'],
        priority: order.priority as WorkOrder['priority'],
        status: order.status as WorkOrder['status'],
        generation_type: order.generation_type as WorkOrder['generation_type']
      }));

      setWorkOrders(typedData);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const stats: WorkOrderStats = {
        total: typedData.length,
        scheduled: typedData.filter(wo => wo.status === 'scheduled').length,
        in_progress: typedData.filter(wo => wo.status === 'in_progress').length,
        completed: typedData.filter(wo => wo.status === 'completed').length,
        overdue: typedData.filter(wo => 
          wo.status !== 'completed' && 
          wo.status !== 'cancelled' && 
          wo.scheduled_date < today
        ).length
      };
      setStats(stats);
      console.log('[useWorkOrders] Loaded via fallback');

    } catch (error: any) {
      console.error('Error fetching work orders:', error);
      toast({
        title: "Error",
        description: "Failed to load work orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkOrder = async (workOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      let createdWorkOrder: any;

      // Try microservice first
      try {
        createdWorkOrder = await workOrderApi.createWorkOrder(workOrder);
      } catch (microserviceError) {
        console.warn('[useWorkOrders] Microservice failed, falling back:', microserviceError);
        
        // Fallback to direct Supabase access
        const { data, error } = await supabase
          .from('work_orders')
          .insert([workOrder])
          .select()
          .single();

        if (error) throw error;
        createdWorkOrder = data;
      }

      // Initialize workflow for the new work order
      if (createdWorkOrder?.id && workOrder.organization_id) {
        try {
          await initializeWorkflow({
            entityId: createdWorkOrder.id,
            entityType: "work_order",
            organizationId: workOrder.organization_id,
          });
        } catch (workflowError) {
          console.warn('Failed to initialize workflow:', workflowError);
          // Don't fail the work order creation if workflow initialization fails
        }
      }

      toast({
        title: "Success",
        description: "Work order created successfully"
      });

      fetchWorkOrders();
      return createdWorkOrder;
    } catch (error: any) {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: "Failed to create work order",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    try {
      // Try microservice first
      try {
        await workOrderApi.updateWorkOrder(id, updates);
        toast({
          title: "Success",
          description: "Work order updated successfully"
        });
        fetchWorkOrders();
        return;
      } catch (microserviceError) {
        console.warn('[useWorkOrders] Microservice failed, falling back:', microserviceError);
      }

      // Fallback to direct Supabase access
      const { error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work order updated successfully"
      });

      fetchWorkOrders();
    } catch (error: any) {
      console.error('Error updating work order:', error);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteWorkOrder = async (id: string) => {
    try {
      // Try microservice first
      try {
        await workOrderApi.deleteWorkOrder(id);
        toast({
          title: "Success",
          description: "Work order deleted successfully"
        });
        fetchWorkOrders();
        return;
      } catch (microserviceError) {
        console.warn('[useWorkOrders] Microservice failed, falling back:', microserviceError);
      }

      // Fallback to direct Supabase access
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work order deleted successfully"
      });

      fetchWorkOrders();
    } catch (error: any) {
      console.error('Error deleting work order:', error);
      toast({
        title: "Error",
        description: "Failed to delete work order",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [currentOrganization?.id, hasCrossProjectAccess]);

  return {
    workOrders,
    stats,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    refetch: fetchWorkOrders
  };
};
