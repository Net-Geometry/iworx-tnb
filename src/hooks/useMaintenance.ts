import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  description: string;
  technician_name?: string;
  performed_date: string;
  cost?: number;
  duration_hours?: number;
  notes?: string;
  status: 'completed' | 'cancelled' | 'in_progress';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

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
  technician?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export const useAssetMaintenance = (assetId: string) => {
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [upcomingWorkOrders, setUpcomingWorkOrders] = useState<WorkOrder[]>([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentOrganization, hasCrossProjectAccess } = useAuth();

  const fetchMaintenanceHistory = async () => {
    try {
      let query = supabase
        .from('maintenance_records')
        .select('*')
        .eq('asset_id', assetId);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error: fetchError } = await query
        .order('performed_date', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      
      // Cast the data to properly typed interfaces
      const typedData: MaintenanceRecord[] = (data || []).map(record => ({
        ...record,
        maintenance_type: record.maintenance_type as MaintenanceRecord['maintenance_type'],
        status: record.status as MaintenanceRecord['status']
      }));
      
      setMaintenanceHistory(typedData);
    } catch (error: any) {
      console.error('Error fetching maintenance history:', error);
      setError(error.message);
    }
  };

  const fetchUpcomingWorkOrders = async () => {
    try {
      let query = supabase
        .from('work_orders')
        .select('*')
        .eq('asset_id', assetId)
        .in('status', ['scheduled', 'in_progress']);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error: fetchError } = await query
        .order('scheduled_date', { ascending: true })
        .limit(10);

      if (fetchError) throw fetchError;
      
      // Cast the data to properly typed interfaces
      const typedData: WorkOrder[] = (data || []).map(order => ({
        ...order,
        maintenance_type: order.maintenance_type as WorkOrder['maintenance_type'],
        priority: order.priority as WorkOrder['priority'],
        status: order.status as WorkOrder['status']
      }));

      // Fetch technician data for work orders
      const technicianIds = [...new Set(typedData
        .map(wo => wo.assigned_technician)
        .filter(Boolean))] as string[];

      let techniciansMap: Record<string, { id: string; first_name: string; last_name: string }> = {};

      if (technicianIds.length > 0) {
        const { data: techniciansData } = await supabase
          .from('people')
          .select('id, first_name, last_name')
          .in('id', technicianIds);

        if (techniciansData) {
          techniciansMap = Object.fromEntries(
            techniciansData.map(tech => [tech.id, tech])
          );
        }
      }

      // Attach technician data to work orders
      const workOrdersWithTechnicians = typedData.map(wo => ({
        ...wo,
        technician: wo.assigned_technician ? techniciansMap[wo.assigned_technician] || null : null
      }));
      
      setUpcomingWorkOrders(workOrdersWithTechnicians);
    } catch (error: any) {
      console.error('Error fetching work orders:', error);
      setError(error.message);
    }
  };

  const fetchRecentWorkOrders = async () => {
    try {
      let query = supabase
        .from('work_orders')
        .select('*')
        .eq('asset_id', assetId)
        .in('status', ['completed', 'cancelled']);

      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      }

      const { data, error: fetchError } = await query
        .order('updated_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      
      // Cast the data to properly typed interfaces
      const typedData: WorkOrder[] = (data || []).map(order => ({
        ...order,
        maintenance_type: order.maintenance_type as WorkOrder['maintenance_type'],
        priority: order.priority as WorkOrder['priority'],
        status: order.status as WorkOrder['status']
      }));

      // Fetch technician data for work orders
      const technicianIds = [...new Set(typedData
        .map(wo => wo.assigned_technician)
        .filter(Boolean))] as string[];

      let techniciansMap: Record<string, { id: string; first_name: string; last_name: string }> = {};

      if (technicianIds.length > 0) {
        const { data: techniciansData } = await supabase
          .from('people')
          .select('id, first_name, last_name')
          .in('id', technicianIds);

        if (techniciansData) {
          techniciansMap = Object.fromEntries(
            techniciansData.map(tech => [tech.id, tech])
          );
        }
      }

      // Attach technician data to work orders
      const workOrdersWithTechnicians = typedData.map(wo => ({
        ...wo,
        technician: wo.assigned_technician ? techniciansMap[wo.assigned_technician] || null : null
      }));
      
      setRecentWorkOrders(workOrdersWithTechnicians);
    } catch (error: any) {
      console.error('Error fetching recent work orders:', error);
      setError(error.message);
    }
  };

  const fetchAll = async () => {
    if (!assetId) return;
    
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchMaintenanceHistory(), fetchUpcomingWorkOrders(), fetchRecentWorkOrders()]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [assetId, currentOrganization?.id, hasCrossProjectAccess]);

  return {
    maintenanceHistory,
    upcomingWorkOrders,
    recentWorkOrders,
    loading,
    error,
    refetch: fetchAll
  };
};