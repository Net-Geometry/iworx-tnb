# Microservices Communication Infrastructure

This directory contains shared utilities for inter-service communication in the iWorX microservices architecture.

## Overview

The iWorX platform uses a microservices architecture where services communicate through:
1. **Synchronous API calls** via the API Gateway
2. **Asynchronous events** via the Event Bus
3. **Correlation tracking** for distributed tracing

## Utilities

### 1. Service Client (`service-client.ts`)

Provides a client for making HTTP requests to other microservices through the API Gateway.

#### Usage Example:

```typescript
import { createServiceClient } from '../_shared/service-client.ts';

// Create client with request context
const serviceClient = createServiceClient('work-order-service', req);

// Make GET request to Asset Service
const assetResponse = await serviceClient.get('/assets/123');
if (assetResponse.error) {
  console.error('Failed to fetch asset:', assetResponse.error);
} else {
  const asset = assetResponse.data;
}

// Make POST request to People Service
const createResponse = await serviceClient.post('/people', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
});
```

#### Features:
- Automatic correlation ID propagation
- Authentication context forwarding
- Comprehensive error handling
- Request/response logging

### 2. Event Bus (`event-bus.ts`)

Provides publish/subscribe functionality for asynchronous inter-service communication.

#### Usage Example:

```typescript
import { createEventBus, DomainEvents } from '../_shared/event-bus.ts';

// Create event bus for your service
const eventBus = createEventBus('work-order-service');

// Publish an event
await eventBus.publish({
  eventType: DomainEvents.WORK_ORDER_CREATED,
  correlationId: 'abc-123',
  payload: {
    workOrderId: '456',
    assetId: '789',
    priority: 'high'
  },
  metadata: {
    createdBy: 'user-123',
    organizationId: 'org-456'
  }
});

// Subscribe to events
eventBus.subscribe(
  [DomainEvents.ASSET_UPDATED, DomainEvents.ASSET_HEALTH_SCORE_UPDATED],
  async (event) => {
    console.log('Received event:', event.eventType);
    console.log('Payload:', event.payload);
    
    // Handle the event
    if (event.eventType === DomainEvents.ASSET_HEALTH_SCORE_UPDATED) {
      // Update work order priority based on asset health
      await updateWorkOrderPriority(event.payload.assetId);
    }
  }
);
```

#### Standard Domain Events:

**Asset Events:**
- `asset.created`
- `asset.updated`
- `asset.deleted`
- `asset.status_changed`
- `asset.health_score_updated`

**Work Order Events:**
- `work_order.created`
- `work_order.assigned`
- `work_order.started`
- `work_order.completed`
- `work_order.cancelled`

**Inventory Events:**
- `inventory.item_created`
- `inventory.stock_changed`
- `inventory.low_stock_alert`
- `inventory.transfer_completed`

**Safety Events:**
- `safety.incident_reported`
- `safety.capa_created`
- `safety.capa_completed`

**People Events:**
- `people.person_created`
- `people.skill_updated`
- `people.team_member_added`

### 3. Correlation Tracking (`correlation.ts`)

Provides utilities for distributed request tracing across services.

#### Usage Example:

```typescript
import { getOrCreateCorrelationId, logWithCorrelation } from '../_shared/correlation.ts';

// Extract or generate correlation ID
const correlationId = getOrCreateCorrelationId(req);

// Log with correlation context
logWithCorrelation(
  correlationId,
  'work-order-service',
  'info',
  'Processing work order creation',
  { workOrderId: '123' }
);

// Include correlation ID in responses
return new Response(JSON.stringify(data), {
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'x-correlation-id': correlationId
  }
});
```

## Best Practices

### 1. Always Use Correlation IDs
Every service should extract or generate correlation IDs and pass them to downstream services:

```typescript
const correlationId = getOrCreateCorrelationId(req);
const serviceClient = createServiceClient('my-service', req);
```

### 2. Handle Service Failures Gracefully
Services should handle failures from other services gracefully:

```typescript
const assetResponse = await serviceClient.get(`/assets/${assetId}`);

if (assetResponse.error) {
  // Log the error but don't fail the entire request
  console.error('Failed to enrich with asset data:', assetResponse.error);
  assetData = null; // Use null instead of failing
}
```

### 3. Publish Events for State Changes
Publish domain events when important state changes occur:

```typescript
// After creating a work order
await eventBus.publish({
  eventType: DomainEvents.WORK_ORDER_CREATED,
  correlationId,
  payload: { workOrderId, assetId, priority },
  metadata: { createdBy: userId }
});
```

### 4. Subscribe to Relevant Events
Services should subscribe to events they care about:

```typescript
// Asset Service listens for work order completions
eventBus.subscribe([DomainEvents.WORK_ORDER_COMPLETED], async (event) => {
  // Update asset maintenance history
  await updateAssetLastMaintenance(event.payload.assetId);
});
```

### 5. Log Comprehensively
Use structured logging with correlation context:

```typescript
logWithCorrelation(
  correlationId,
  'service-name',
  'info',
  'Operation description',
  { key: 'value' }
);
```

## Architecture Patterns

### Synchronous Communication (Request/Response)
Use service client for operations requiring immediate response:
- Fetching data from another service
- Validating data against another service
- Coordinated multi-service updates

### Asynchronous Communication (Events)
Use event bus for operations that don't require immediate response:
- Notifying other services of state changes
- Triggering workflows in other services
- Maintaining eventual consistency

### Saga Pattern (Distributed Transactions)
For complex multi-service workflows:

```typescript
// 1. Start saga - create work order
const wo = await createWorkOrder(data);

try {
  // 2. Reserve inventory
  await serviceClient.post('/inventory/reserve', {
    items: wo.required_parts,
    workOrderId: wo.id
  });
  
  // 3. Publish success event
  await eventBus.publish({
    eventType: 'work_order.inventory_reserved',
    payload: { workOrderId: wo.id }
  });
} catch (error) {
  // 4. Compensate - delete work order
  await deleteWorkOrder(wo.id);
  throw error;
}
```

## Troubleshooting

### Viewing Correlation Traces
Search logs by correlation ID to trace requests across services:
```bash
# In Supabase dashboard
SELECT * FROM domain_events 
WHERE correlation_id = 'your-correlation-id'
ORDER BY published_at;
```

### Debugging Service Communication
Enable verbose logging in service client by checking console logs:
- `[Service Client]` prefix shows inter-service API calls
- `[Event Bus]` prefix shows event publishing/receiving
- `[API Gateway]` prefix shows request routing

### Common Issues

**Issue: Service not receiving events**
- Check that event types match exactly
- Verify service is subscribed before events are published
- Check Supabase Realtime is enabled

**Issue: Correlation IDs not propagating**
- Ensure API Gateway is adding correlation headers
- Verify service client is using `createServiceClient()`
- Check headers are being forwarded in service calls

**Issue: Service calls timing out**
- Check service is running and healthy
- Verify API Gateway has correct service URLs
- Check network connectivity between services

## Examples

See `work-order-service-enhanced/index.ts` for a complete example of:
- Service-to-service communication
- Event publishing
- Correlation tracking
- Error handling
