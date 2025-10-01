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
  /**
   * Get all assets with optional filters
   */
  getAssets: (filters?: {
    status?: string;
    criticality?: string;
    type?: string;
    search?: string;
  }) => {
    return apiClient.get("/api/assets", filters as Record<string, string>);
  },

  /**
   * Get single asset by ID
   */
  getAssetById: (id: string) => {
    return apiClient.get(`/api/assets/${id}`);
  },

  /**
   * Create new asset
   */
  createAsset: (assetData: any) => {
    return apiClient.post("/api/assets", assetData);
  },

  /**
   * Update existing asset
   */
  updateAsset: (id: string, assetData: any) => {
    return apiClient.put(`/api/assets/${id}`, assetData);
  },

  /**
   * Delete asset
   */
  deleteAsset: (id: string) => {
    return apiClient.delete(`/api/assets/${id}`);
  },

  /**
   * Get asset hierarchy
   */
  getAssetHierarchy: (id: string) => {
    return apiClient.get(`/api/assets/${id}/hierarchy`);
  },
};
