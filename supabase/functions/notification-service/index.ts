/**
 * Notification Service - Location-Based Work Order Notifications
 * 
 * This service subscribes to work order events via the Event Bus and
 * automatically notifies engineers assigned to the work order's location.
 * 
 * Features:
 * - Event-driven architecture (subscribes to WORK_ORDER_CREATED events)
 * - Location-based engineer lookup via person_locations table
 * - Automatic notification creation for relevant engineers
 * - Correlation ID tracking for distributed tracing
 * - Graceful error handling with detailed logging
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { createEventBus, DomainEvents } from '../_shared/event-bus.ts';
import { logWithCorrelation } from '../_shared/correlation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkOrderCreatedEvent {
  eventId: string;
  eventType: string;
  serviceName: string;
  timestamp: string;
  correlationId?: string;
  payload: {
    workOrderId: string;
    assetId: string;
    locationNodeId?: string;
    priority: string;
    scheduledDate: string;
  };
  metadata?: {
    createdBy?: string;
    organizationId: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Initialize event bus
  const eventBus = createEventBus('notification-service');

  console.log('[Notification Service] Starting up and subscribing to events...');

  // Subscribe to WORK_ORDER_CREATED events
  eventBus.subscribe([DomainEvents.WORK_ORDER_CREATED], async (event) => {
    const correlationId = event.correlationId || 'no-correlation-id';
    
    try {
      logWithCorrelation(
        correlationId,
        'notification-service',
        'info',
        'Processing WORK_ORDER_CREATED event',
        { eventId: event.eventId, workOrderId: event.payload?.workOrderId }
      );

      const workOrderId = event.payload?.workOrderId;
      const locationNodeId = event.payload?.locationNodeId;
      const assetId = event.payload?.assetId;
      const priority = event.payload?.priority;
      const scheduledDate = event.payload?.scheduledDate;
      const organizationId = event.metadata?.organizationId;

      // Skip if no location is specified
      if (!locationNodeId) {
        logWithCorrelation(
          correlationId,
          'notification-service',
          'info',
          'No location specified for work order, skipping notifications',
          { workOrderId }
        );
        return;
      }

      // Step 1: Find all engineers assigned to this location
      const { data: personLocations, error: locationError } = await supabase
        .from('person_locations')
        .select(`
          person_id,
          people_service.people!inner(
            user_id,
            first_name,
            last_name,
            is_active
          )
        `)
        .eq('hierarchy_node_id', locationNodeId)
        .eq('is_active', true)
        .eq('people_service.people.is_active', true);

      if (locationError) {
        logWithCorrelation(
          correlationId,
          'notification-service',
          'error',
          'Error fetching person locations',
          { error: locationError.message, locationNodeId }
        );
        return;
      }

      if (!personLocations || personLocations.length === 0) {
        logWithCorrelation(
          correlationId,
          'notification-service',
          'info',
          'No engineers assigned to this location',
          { locationNodeId, workOrderId }
        );
        return;
      }

      logWithCorrelation(
        correlationId,
        'notification-service',
        'info',
        `Found ${personLocations.length} engineers at location`,
        { locationNodeId, engineerCount: personLocations.length }
      );

      // Step 2: Fetch work order details for notification content
      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .select(`
          id,
          title,
          description,
          priority,
          scheduled_date,
          maintenance_type,
          assets!inner(
            name,
            asset_number
          )
        `)
        .eq('id', workOrderId)
        .single();

      if (woError) {
        logWithCorrelation(
          correlationId,
          'notification-service',
          'error',
          'Error fetching work order details',
          { error: woError.message, workOrderId }
        );
        return;
      }

      // Step 3: Fetch location hierarchy for path display
      const { data: location, error: locError } = await supabase
        .from('hierarchy_nodes')
        .select('name, path')
        .eq('id', locationNodeId)
        .single();

      const locationPath = location?.path || location?.name || 'Unknown Location';

      // Step 4: Create notifications for each engineer
      const notifications = personLocations.map((pl: any) => {
        const person = pl.people_service?.people;
        if (!person?.user_id) return null;

        const asset = workOrder.assets?.[0];
        const assetName = asset?.name || 'Unknown Asset';
        const assetNumber = asset?.asset_number || '';
        
        return {
          user_id: person.user_id,
          work_order_id: workOrderId,
          notification_type: 'work_order_created',
          title: `New Work Order at ${locationPath}`,
          message: `A new ${priority} priority ${workOrder.maintenance_type} work order has been assigned to your location: "${workOrder.title}" for ${assetName} ${assetNumber ? `(${assetNumber})` : ''}`,
          is_read: false,
          metadata: {
            asset_name: assetName,
            asset_number: assetNumber,
            scheduled_date: scheduledDate,
            priority: priority,
            location_path: locationPath,
            maintenance_type: workOrder.maintenance_type,
            correlation_id: correlationId,
          },
          organization_id: organizationId,
        };
      }).filter(Boolean); // Remove null entries

      if (notifications.length === 0) {
        logWithCorrelation(
          correlationId,
          'notification-service',
          'warn',
          'No valid user_ids found for engineers',
          { locationNodeId, personLocations: personLocations.length }
        );
        return;
      }

      // Step 5: Insert notifications into database
      const { data: insertedNotifications, error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (notifError) {
        logWithCorrelation(
          correlationId,
          'notification-service',
          'error',
          'Error creating notifications',
          { error: notifError.message, notificationCount: notifications.length }
        );
        return;
      }

      logWithCorrelation(
        correlationId,
        'notification-service',
        'info',
        'Successfully created notifications',
        {
          workOrderId,
          locationNodeId,
          notificationCount: insertedNotifications?.length || 0,
          engineerIds: notifications.map((n: any) => n.user_id),
        }
      );

    } catch (error) {
      logWithCorrelation(
        correlationId,
        'notification-service',
        'error',
        'Unexpected error processing event',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          eventId: event.eventId,
        }
      );
    }
  });

  console.log('[Notification Service] Event subscriptions active');

  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        service: 'notification-service',
        status: 'running',
        subscriptions: [DomainEvents.WORK_ORDER_CREATED],
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Notification service is running' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
});
