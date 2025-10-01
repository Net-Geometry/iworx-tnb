/**
 * Service-to-Service Communication Client
 * 
 * Provides utilities for microservices to communicate with each other
 * through the API Gateway with proper authentication, correlation tracking,
 * and error handling.
 */

export interface ServiceClientConfig {
  serviceName: string;
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  hasCrossProjectAccess?: boolean;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  status: number;
  correlationId?: string;
}

/**
 * Generate a unique correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Service Client for inter-service communication
 */
export class ServiceClient {
  private baseUrl: string;
  private config: ServiceClientConfig;

  constructor(config: ServiceClientConfig) {
    this.baseUrl = Deno.env.get('SUPABASE_URL')!;
    this.config = {
      ...config,
      correlationId: config.correlationId || generateCorrelationId(),
    };
  }

  /**
   * Make a GET request to another service
   */
  async get<T>(path: string): Promise<ServiceResponse<T>> {
    return this.request<T>('GET', path);
  }

  /**
   * Make a POST request to another service
   */
  async post<T>(path: string, body?: any): Promise<ServiceResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  /**
   * Make a PUT request to another service
   */
  async put<T>(path: string, body?: any): Promise<ServiceResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  /**
   * Make a DELETE request to another service
   */
  async delete<T>(path: string): Promise<ServiceResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  /**
   * Core request method with error handling and correlation tracking
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<ServiceResponse<T>> {
    const url = `${this.baseUrl}/functions/v1/api-gateway/api${path}`;
    
    console.log(`[Service Client] ${method} ${path}`, {
      correlationId: this.config.correlationId,
      from: this.config.serviceName,
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-correlation-id': this.config.correlationId!,
        'x-calling-service': this.config.serviceName,
      };

      // Add authentication context
      if (this.config.userId) {
        headers['x-user-id'] = this.config.userId;
      }
      if (this.config.organizationId) {
        headers['x-organization-id'] = this.config.organizationId;
      }
      if (this.config.hasCrossProjectAccess) {
        headers['x-cross-project-access'] = 'true';
      }

      // Add service role key for internal service calls
      headers['apikey'] = Deno.env.get('SUPABASE_ANON_KEY')!;
      headers['Authorization'] = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`;

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[Service Client] Error response from ${path}:`, {
          status: response.status,
          error: data.error,
          correlationId: this.config.correlationId,
        });

        return {
          error: data.error || `Service request failed with status ${response.status}`,
          status: response.status,
          correlationId: this.config.correlationId,
        };
      }

      console.log(`[Service Client] Success: ${method} ${path}`, {
        correlationId: this.config.correlationId,
      });

      return {
        data,
        status: response.status,
        correlationId: this.config.correlationId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`[Service Client] Request failed:`, {
        method,
        path,
        error: errorMessage,
        correlationId: this.config.correlationId,
      });

      return {
        error: errorMessage,
        status: 500,
        correlationId: this.config.correlationId,
      };
    }
  }
}

/**
 * Create a service client with context from request headers
 */
export function createServiceClient(
  serviceName: string,
  req: Request
): ServiceClient {
  const correlationId = req.headers.get('x-correlation-id') || generateCorrelationId();
  const userId = req.headers.get('x-user-id') || undefined;
  const organizationId = req.headers.get('x-organization-id') || undefined;
  const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';

  return new ServiceClient({
    serviceName,
    correlationId,
    userId,
    organizationId,
    hasCrossProjectAccess,
  });
}
