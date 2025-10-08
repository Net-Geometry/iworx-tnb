/**
 * Event-Driven Messaging System
 * 
 * Provides publish/subscribe functionality for asynchronous
 * inter-service communication using Supabase Realtime.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  serviceName: string;
  correlationId?: string;
  timestamp: string;
  payload: any;
  metadata?: Record<string, any>;
}

/**
 * Event Bus for publishing and subscribing to domain events
 */
export class EventBus {
  private supabase;
  private serviceName: string;

  constructor(serviceName: string) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.serviceName = serviceName;
  }

  /**
   * Publish a domain event to all subscribers
   */
  async publish(event: Omit<DomainEvent, 'eventId' | 'serviceName' | 'timestamp'>): Promise<void> {
    const domainEvent: DomainEvent = {
      ...event,
      eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceName: this.serviceName,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Event Bus] Publishing event:`, {
      eventType: domainEvent.eventType,
      eventId: domainEvent.eventId,
      service: this.serviceName,
      correlationId: domainEvent.correlationId,
    });

    try {
      // Store event in database for event sourcing and audit trail
      const { error: insertError } = await this.supabase
        .from('domain_events')
        .insert([{
          event_id: domainEvent.eventId,
          event_type: domainEvent.eventType,
          service_name: domainEvent.serviceName,
          correlation_id: domainEvent.correlationId,
          payload: domainEvent.payload,
          metadata: domainEvent.metadata,
          published_at: domainEvent.timestamp,
        }]);

      if (insertError) {
        console.warn('[Event Bus] Failed to store event:', insertError);
        // Don't throw - continue with broadcast even if storage fails
      }

      // Broadcast event via Realtime
      const channel = this.supabase.channel(`events:${domainEvent.eventType}`);
      await channel.send({
        type: 'broadcast',
        event: domainEvent.eventType,
        payload: domainEvent,
      });

      console.log(`[Event Bus] Event published successfully:`, domainEvent.eventId);
    } catch (error) {
      console.error('[Event Bus] Failed to publish event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventTypes: string[], handler: (event: DomainEvent) => Promise<void> | void): void {
    console.log(`[Event Bus] ${this.serviceName} subscribing to events:`, eventTypes);

    eventTypes.forEach(eventType => {
      const channel = this.supabase.channel(`events:${eventType}`);
      
      channel
        .on('broadcast', { event: eventType }, async (message) => {
          const event = message.payload as DomainEvent;
          
          console.log(`[Event Bus] ${this.serviceName} received event:`, {
            eventType: event.eventType,
            eventId: event.eventId,
            fromService: event.serviceName,
          });

          try {
            await handler(event);
            console.log(`[Event Bus] Event handled successfully:`, event.eventId);
          } catch (error) {
            console.error(`[Event Bus] Error handling event ${event.eventId}:`, error);
          }
        })
        .subscribe();
    });
  }
}

/**
 * Standard domain event types
 */
export const DomainEvents = {
  // Asset events
  ASSET_CREATED: 'asset.created',
  ASSET_UPDATED: 'asset.updated',
  ASSET_DELETED: 'asset.deleted',
  ASSET_STATUS_CHANGED: 'asset.status_changed',
  ASSET_HEALTH_SCORE_UPDATED: 'asset.health_score_updated',

  // Work Order events
  WORK_ORDER_CREATED: 'work_order.created',
  WORK_ORDER_UPDATED: 'work_order.updated',
  WORK_ORDER_ASSIGNED: 'work_order.assigned',
  WORK_ORDER_STARTED: 'work_order.started',
  WORK_ORDER_COMPLETED: 'work_order.completed',
  WORK_ORDER_CANCELLED: 'work_order.cancelled',

  // Inventory events
  INVENTORY_ITEM_CREATED: 'inventory.item_created',
  INVENTORY_ITEM_UPDATED: 'inventory.item_updated',
  INVENTORY_STOCK_CHANGED: 'inventory.stock_changed',
  INVENTORY_LOW_STOCK_ALERT: 'inventory.low_stock_alert',
  INVENTORY_TRANSFER_INITIATED: 'inventory.transfer_initiated',
  INVENTORY_TRANSFER_COMPLETED: 'inventory.transfer_completed',

  // Safety events
  INCIDENT_REPORTED: 'safety.incident_reported',
  INCIDENT_INVESTIGATED: 'safety.incident_investigated',
  CAPA_CREATED: 'safety.capa_created',
  CAPA_COMPLETED: 'safety.capa_completed',

  // People events
  PERSON_CREATED: 'people.person_created',
  PERSON_SKILL_UPDATED: 'people.skill_updated',
  TEAM_CREATED: 'people.team_created',
  TEAM_MEMBER_ADDED: 'people.team_member_added',

  // Job Plan events
  JOB_PLAN_CREATED: 'job_plan.created',
  JOB_PLAN_UPDATED: 'job_plan.updated',
  JOB_PLAN_DELETED: 'job_plan.deleted',
  JOB_PLAN_USED: 'job_plan.used',
  JOB_PLAN_APPROVED: 'job_plan.approved',

  // PM Schedule events
  PM_SCHEDULE_CREATED: 'pm_schedule.created',
  PM_SCHEDULE_UPDATED: 'pm_schedule.updated',
  PM_SCHEDULE_COMPLETED: 'pm_schedule.completed',
  PM_SCHEDULE_PAUSED: 'pm_schedule.paused',
  PM_SCHEDULE_RESUMED: 'pm_schedule.resumed',
  PM_WORK_ORDER_GENERATED: 'pm_schedule.work_order_generated',
  PM_MATERIAL_ASSIGNED: 'pm_schedule.material_assigned',

  // Route Management Events
  ROUTE_CREATED: 'route.created',
  ROUTE_UPDATED: 'route.updated',
  ROUTE_DELETED: 'route.deleted',
  ROUTE_ASSET_ADDED: 'route.asset_added',
  ROUTE_ASSET_REMOVED: 'route.asset_removed',
  ROUTE_ASSET_REORDERED: 'route.asset_reordered',
  ROUTE_PM_ASSIGNED: 'route.pm_assigned',
  ROUTE_PM_UNASSIGNED: 'route.pm_unassigned',

  // Workflow Events
  WORKFLOW_INITIALIZED: 'workflow.initialized',
  WORKFLOW_STEP_TRANSITIONED: 'workflow.step_transitioned',
  WORKFLOW_STEP_APPROVED: 'workflow.step_approved',
  WORKFLOW_STEP_REJECTED: 'workflow.step_rejected',
  WORKFLOW_STEP_REASSIGNED: 'workflow.step_reassigned',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_TEMPLATE_CREATED: 'workflow.template_created',
  WORKFLOW_TEMPLATE_UPDATED: 'workflow.template_updated',
  WORKFLOW_TEMPLATE_DELETED: 'workflow.template_deleted',

  // AI & Predictive Maintenance Events
  ANOMALY_DETECTED: 'ai.anomaly_detected',
  ANOMALY_ACKNOWLEDGED: 'ai.anomaly_acknowledged',
  ANOMALY_RESOLVED: 'ai.anomaly_resolved',
  ML_PREDICTION_GENERATED: 'ai.prediction_generated',
  ASSET_HEALTH_DEGRADED: 'ai.health_degraded',
  WORK_ORDER_AI_PRIORITIZED: 'ai.work_order_prioritized',
  FAILURE_RISK_HIGH: 'ai.failure_risk_high',

  // IoT Device Events
  DEVICE_REGISTERED: 'iot.device_registered',
  DEVICE_UPDATED: 'iot.device_updated',
  DEVICE_DELETED: 'iot.device_deleted',
  DEVICE_DATA_RECEIVED: 'iot.data_received',
  DEVICE_OFFLINE: 'iot.device_offline',
  DEVICE_THRESHOLD_EXCEEDED: 'iot.threshold_exceeded',
  METER_READING_AUTO_CREATED: 'iot.meter_reading_auto_created',
} as const;

/**
 * Create an event bus instance for a service
 */
export function createEventBus(serviceName: string): EventBus {
  return new EventBus(serviceName);
}
