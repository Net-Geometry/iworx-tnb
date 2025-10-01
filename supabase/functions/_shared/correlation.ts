/**
 * Correlation ID utilities for distributed tracing
 * 
 * Provides utilities to track requests across multiple services
 * for debugging and monitoring purposes.
 */

/**
 * Extract correlation ID from request or generate a new one
 */
export function getOrCreateCorrelationId(req: Request): string {
  const correlationId = req.headers.get('x-correlation-id');
  
  if (correlationId) {
    return correlationId;
  }

  // Generate new correlation ID
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log('[Correlation] Generated new correlation ID:', newId);
  return newId;
}

/**
 * Create headers with correlation ID for service-to-service calls
 */
export function createCorrelationHeaders(
  correlationId: string,
  callingService: string
): Record<string, string> {
  return {
    'x-correlation-id': correlationId,
    'x-calling-service': callingService,
  };
}

/**
 * Log with correlation context
 */
export function logWithCorrelation(
  correlationId: string,
  serviceName: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: any
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    correlationId,
    service: serviceName,
    level,
    message,
    ...(data && { data }),
  };

  const logMessage = `[${level.toUpperCase()}] ${serviceName} - ${message}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage, logEntry);
      break;
    case 'warn':
      console.warn(logMessage, logEntry);
      break;
    default:
      console.log(logMessage, logEntry);
  }
}
