import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  created_at: string;
  updated_at: string;
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

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
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
        status: order.status as WorkOrder['status']
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
      const { data, error } = await supabase
        .from('work_orders')
        .insert([workOrder])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work order created successfully"
      });

      fetchWorkOrders();
      return data;
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
