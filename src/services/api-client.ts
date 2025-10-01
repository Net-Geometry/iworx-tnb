/**
 * API Client for Microservices Architecture
 * 
 * Centralized client for making API calls to microservices through the API Gateway.
 * Handles authentication, error handling, and request/response transformation.
 */

import { supabase } from "@/integrations/supabase/client";

// API Gateway base URL
const API_GATEWAY_URL = "https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/api-gateway";

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
}

/**
 * API Request options
 */
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

/**
 * API Client class
 */
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_GATEWAY_URL;
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Get authentication token from Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body, params, headers = {} } = options;

    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Get auth token
    const token = await this.getAuthToken();
    
    // Build headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.get("/api/health");
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Asset Service API
 */
export const assetApi = {
  async getAssets() {
    return apiClient.get('/assets');
  },

  async getAssetById(id: string) {
    return apiClient.get(`/assets/${id}`);
  },

  async createAsset(asset: any) {
    return apiClient.post('/assets', asset);
  },

  async updateAsset(id: string, updates: any) {
    return apiClient.put(`/assets/${id}`, updates);
  },

  async deleteAsset(id: string) {
    return apiClient.delete(`/assets/${id}`);
  },

  async getAssetHierarchy() {
    return apiClient.get('/assets/hierarchy');
  },
};

/**
 * People & Labor Management API
 */
export const peopleApi = {
  // People endpoints
  async getPeople() {
    return apiClient.get('/api/people');
  },
  async getPerson(id: string) {
    return apiClient.get(`/api/people/${id}`);
  },
  async createPerson(data: any) {
    return apiClient.post('/api/people', data);
  },
  async updatePerson(id: string, data: any) {
    return apiClient.put(`/api/people/${id}`, data);
  },
  async deletePerson(id: string) {
    return apiClient.delete(`/api/people/${id}`);
  },

  // Teams endpoints
  async getTeams() {
    return apiClient.get('/api/people/teams');
  },
  async getTeam(id: string) {
    return apiClient.get(`/api/people/teams/${id}`);
  },
  async createTeam(data: any) {
    return apiClient.post('/api/people/teams', data);
  },
  async updateTeam(id: string, data: any) {
    return apiClient.put(`/api/people/teams/${id}`, data);
  },
  async deleteTeam(id: string) {
    return apiClient.delete(`/api/people/teams/${id}`);
  },

  // Team members endpoints
  async getTeamMembers(params?: { person_id?: string; team_id?: string }) {
    return apiClient.get('/api/people/team-members', params);
  },
  async addTeamMember(data: any) {
    return apiClient.post('/api/people/team-members', data);
  },
  async updateTeamMember(id: string, data: any) {
    return apiClient.put(`/api/people/team-members/${id}`, data);
  },
  async removeTeamMember(id: string) {
    return apiClient.delete(`/api/people/team-members/${id}`);
  },

  // Skills endpoints
  async getSkills() {
    return apiClient.get('/api/people/skills');
  },
  async createSkill(data: any) {
    return apiClient.post('/api/people/skills', data);
  },
  async updateSkill(id: string, data: any) {
    return apiClient.put(`/api/people/skills/${id}`, data);
  },
  async deleteSkill(id: string) {
    return apiClient.delete(`/api/people/skills/${id}`);
  },

  // Person skills endpoints
  async getPersonSkills(personId?: string) {
    return apiClient.get('/api/people/person-skills', personId ? { person_id: personId } : undefined);
  },
  async assignPersonSkill(data: any) {
    return apiClient.post('/api/people/person-skills', data);
  },
  async updatePersonSkill(id: string, data: any) {
    return apiClient.put(`/api/people/person-skills/${id}`, data);
  },
  async removePersonSkill(id: string) {
    return apiClient.delete(`/api/people/person-skills/${id}`);
  },

  // Crafts endpoints
  async getCrafts() {
    return apiClient.get('/api/people/crafts');
  },
  async createCraft(data: any) {
    return apiClient.post('/api/people/crafts', data);
  },
  async updateCraft(id: string, data: any) {
    return apiClient.put(`/api/people/crafts/${id}`, data);
  },
  async deleteCraft(id: string) {
    return apiClient.delete(`/api/people/crafts/${id}`);
  },

  // Person crafts endpoints
  async getPersonCrafts(personId?: string) {
    return apiClient.get('/api/people/person-crafts', personId ? { person_id: personId } : undefined);
  },
  async assignPersonCraft(data: any) {
    return apiClient.post('/api/people/person-crafts', data);
  },
  async updatePersonCraft(id: string, data: any) {
    return apiClient.put(`/api/people/person-crafts/${id}`, data);
  },
  async removePersonCraft(id: string) {
    return apiClient.delete(`/api/people/person-crafts/${id}`);
  },
};

// Work Order API methods
export const workOrderApi = {
  async getWorkOrders() {
    return apiClient.get('/work-orders');
  },

  async getWorkOrderById(id: string) {
    return apiClient.get(`/work-orders/${id}`);
  },

  async createWorkOrder(workOrder: any) {
    return apiClient.post('/work-orders', workOrder);
  },

  async updateWorkOrder(id: string, updates: any) {
    return apiClient.put(`/work-orders/${id}`, updates);
  },

  async deleteWorkOrder(id: string) {
    return apiClient.delete(`/work-orders/${id}`);
  },

  async getWorkOrderStats() {
    return apiClient.get('/work-orders/stats');
  },
};

/**
 * Inventory Service API
 */
export const inventoryApi = {
  async getItems() {
    return apiClient.get('/inventory/items');
  },

  async getItemById(id: string) {
    return apiClient.get(`/inventory/items/${id}`);
  },

  async createItem(item: any) {
    return apiClient.post('/inventory/items', item);
  },

  async updateItem(id: string, updates: any) {
    return apiClient.put(`/inventory/items/${id}`, updates);
  },

  async deleteItem(id: string) {
    return apiClient.delete(`/inventory/items/${id}`);
  },

  async getLocations() {
    return apiClient.get('/inventory/locations');
  },

  async getLocationsWithItems() {
    return apiClient.get('/inventory/locations/with-items');
  },

  async createLocation(location: any) {
    return apiClient.post('/inventory/locations', location);
  },

  async getSuppliers() {
    return apiClient.get('/inventory/suppliers');
  },

  async createSupplier(supplier: any) {
    return apiClient.post('/inventory/suppliers', supplier);
  },

  async getStats() {
    return apiClient.get('/inventory/stats');
  },
};
