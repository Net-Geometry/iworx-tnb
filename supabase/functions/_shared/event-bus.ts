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
} as const;

/**
 * Create an event bus instance for a service
 */
export function createEventBus(serviceName: string): EventBus {
  return new EventBus(serviceName);
}
