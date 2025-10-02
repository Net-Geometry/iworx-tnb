/**
 * Enhanced Work Order Service with Service-to-Service Communication
 * 
 * Demonstrates inter-service communication by fetching related data
 * from other services (Asset Service, People Service) via API Gateway.
 * 
 * Features:
 * - Correlation ID tracking for distributed tracing
 * - Event publishing for domain events
 * - Service-to-service API calls
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { ServiceClient, createServiceClient, generateCorrelationId } from '../_shared/service-client.ts';
import { EventBus, createEventBus, DomainEvents } from '../_shared/event-bus.ts';
import { getOrCreateCorrelationId, logWithCorrelation } from '../_shared/correlation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-organization-id, x-correlation-id',
};

interface WorkOrder {
  id?: string;
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
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract context from headers (set by API Gateway)
    const userId = req.headers.get('x-user-id');
    const organizationId = req.headers.get('x-organization-id');
    const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';
    const correlationId = getOrCreateCorrelationId(req);

    // Initialize service client and event bus
    const serviceClient = createServiceClient('work-order-service', req);
    const eventBus = createEventBus('work-order-service');

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    logWithCorrelation(correlationId, 'work-order-service', 'info', `${method} ${url.pathname}`, {
      userId,
      organizationId,
    });

    // GET /work-orders - List all work orders WITH enriched asset data
    if (method === 'GET' && pathParts.length === 0) {
      let query = supabase.from('work_orders').select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: workOrders, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Enrich work orders with asset data from Asset Service
      const enrichedWorkOrders = await Promise.all(
        workOrders.map(async (wo) => {
          if (!wo.asset_id) return wo;

          // Call Asset Service to get asset details
          const assetResponse = await serviceClient.get(`/assets/${wo.asset_id}`);
          
          return {
            ...wo,
            asset: assetResponse.data || null,
            _enriched: true,
          };
        })
      );

      logWithCorrelation(correlationId, 'work-order-service', 'info', 
        `Retrieved ${enrichedWorkOrders.length} work orders with enriched data`);

      return new Response(JSON.stringify(enrichedWorkOrders), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        status: 200,
      });
    }

    // GET /work-orders/:id - Get single work order with enriched data
    if (method === 'GET' && pathParts.length === 1) {
      const workOrderId = pathParts[0];

      let query = supabase.from('work_orders').select('*').eq('id', workOrderId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: workOrder, error } = await query.single();

      if (error) throw error;

      // Enrich with asset data
      let assetData = null;
      if (workOrder.asset_id) {
        const assetResponse = await serviceClient.get(`/assets/${workOrder.asset_id}`);
        assetData = assetResponse.data;
      }

      // Enrich with assigned technician data if available
      let technicianData = null;
      if (workOrder.assigned_technician) {
        const peopleResponse = await serviceClient.get(`/people/${workOrder.assigned_technician}`);
        technicianData = peopleResponse.data;
      }

      const enrichedWorkOrder = {
        ...workOrder,
        asset: assetData,
        technician: technicianData,
        _enriched: true,
      };

      logWithCorrelation(correlationId, 'work-order-service', 'info', 
        `Retrieved work order ${workOrderId} with enriched data`);

      return new Response(JSON.stringify(enrichedWorkOrder), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        status: 200,
      });
    }

    // POST /work-orders - Create new work order with event publishing
    if (method === 'POST' && pathParts.length === 0) {
      const workOrder: WorkOrder = await req.json();

      // Ensure organization_id is set
      if (!workOrder.organization_id && organizationId) {
        workOrder.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .insert([workOrder])
        .select()
        .single();

      if (error) throw error;

      logWithCorrelation(correlationId, 'work-order-service', 'info', 
        `Created work order: ${data.id}`);

      // Publish domain event with location information
      await eventBus.publish({
        eventType: DomainEvents.WORK_ORDER_CREATED,
        correlationId,
        payload: {
          workOrderId: data.id,
          assetId: data.asset_id,
          locationNodeId: data.location_node_id, // Include location for notification routing
          priority: data.priority,
          scheduledDate: data.scheduled_date,
        },
        metadata: {
          createdBy: userId,
          organizationId: data.organization_id,
        },
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        status: 201,
      });
    }

    // PUT /work-orders/:id - Update work order with event publishing
    if (method === 'PUT' && pathParts.length === 1) {
      const workOrderId = pathParts[0];
      const updates = await req.json();

      // Get existing work order to detect changes
      const { data: existing } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', workOrderId)
        .single();

      let query = supabase
        .from('work_orders')
        .update(updates)
        .eq('id', workOrderId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      logWithCorrelation(correlationId, 'work-order-service', 'info', 
        `Updated work order: ${workOrderId}`);

      // Publish appropriate domain event based on what changed
      if (existing && existing.status !== data.status) {
        let eventType: string = DomainEvents.WORK_ORDER_UPDATED;
        
        if (data.status === 'in_progress') {
          eventType = DomainEvents.WORK_ORDER_STARTED;
        } else if (data.status === 'completed') {
          eventType = DomainEvents.WORK_ORDER_COMPLETED;
        } else if (data.status === 'cancelled') {
          eventType = DomainEvents.WORK_ORDER_CANCELLED;
        }

        await eventBus.publish({
          eventType,
          correlationId,
          payload: {
            workOrderId: data.id,
            previousStatus: existing.status,
            newStatus: data.status,
            assetId: data.asset_id,
          },
          metadata: {
            updatedBy: userId,
            organizationId: data.organization_id,
          },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        status: 200,
      });
    }

    // DELETE /work-orders/:id - Delete work order
    if (method === 'DELETE' && pathParts.length === 1) {
      const workOrderId = pathParts[0];

      let query = supabase.from('work_orders').delete().eq('id', workOrderId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { error } = await query;

      if (error) throw error;

      logWithCorrelation(correlationId, 'work-order-service', 'info', 
        `Deleted work order: ${workOrderId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        status: 200,
      });
    }

    // GET /work-orders/stats - Get work order statistics
    if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'stats') {
      let query = supabase.from('work_orders').select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const stats = {
        total: data.length,
        scheduled: data.filter(wo => wo.status === 'scheduled').length,
        in_progress: data.filter(wo => wo.status === 'in_progress').length,
        completed: data.filter(wo => wo.status === 'completed').length,
        overdue: data.filter(wo => 
          wo.status !== 'completed' && 
          wo.status !== 'cancelled' && 
          wo.scheduled_date < today
        ).length
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
      status: 404,
    });

  } catch (error) {
    console.error('[Work Order Service Enhanced] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
