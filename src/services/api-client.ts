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
 * Get authentication headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

/**
 * Asset Service API
 */
export const assetApi = {
  async getAssets() {
    const response = await fetch(`${API_GATEWAY_URL}/api/assets`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  async getAssetById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/assets/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch asset');
    return response.json();
  },

  async createAsset(asset: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/assets`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(asset),
    });
    if (!response.ok) throw new Error('Failed to create asset');
    return response.json();
  },

  async updateAsset(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/assets/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  async deleteAsset(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/assets/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  },
};

// Work Order API methods
export const workOrderApi = {
  async getWorkOrders() {
    const response = await fetch(`${API_GATEWAY_URL}/api/work-orders`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch work orders');
    return response.json();
  },

  async getWorkOrderById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/work-orders/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch work order');
    return response.json();
  },

  async createWorkOrder(workOrder: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/work-orders`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(workOrder),
    });
    if (!response.ok) throw new Error('Failed to create work order');
    return response.json();
  },

  async updateWorkOrder(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/work-orders/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update work order');
    return response.json();
  },

  async deleteWorkOrder(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/work-orders/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete work order');
    return response.json();
  },
  
  async getWorkOrderStats() {
    const response = await fetch(`${API_GATEWAY_URL}/api/work-orders/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch work order stats');
    return response.json();
  },
};

/**
 * Inventory Service API
 */
export const inventoryApi = {
  async getItems() {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/items`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },

  async getItemById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/items/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  },

  async createItem(item: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/items`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to create item');
    return response.json();
  },

  async updateItem(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/items/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  },

  async deleteItem(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/items/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return response.json();
  },

  async getLocations() {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/locations`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch locations');
    return response.json();
  },
  
  async getLocationsWithItems() {
    return inventoryApi.getLocations();
  },

  async createLocation(location: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/locations`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(location),
    });
    if (!response.ok) throw new Error('Failed to create location');
    return response.json();
  },

  async getSuppliers() {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/suppliers`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return response.json();
  },

  async createSupplier(supplier: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/inventory/suppliers`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error('Failed to create supplier');
    return response.json();
  },
};

// People API
export const peopleApi = {
  getAll: async () => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch people');
    return response.json();
  },
  getPeople: async () => peopleApi.getAll(),
  
  getById: async (id: string) => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch person');
    return response.json();
  },
  getPerson: async (id: string) => peopleApi.getById(id),

  create: async (data: any) => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create person');
    return response.json();
  },
  createPerson: async (data: any) => peopleApi.create(data),

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update person');
    return response.json();
  },
  updatePerson: async (id: string, data: any) => peopleApi.update(id, data),

  delete: async (id: string) => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete person');
    return response.json();
  },
  deletePerson: async (id: string) => peopleApi.delete(id),
  
  getTeams: async () => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people/teams`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch teams');
    return response.json();
  },
  
  getSkills: async () => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people/skills`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },
  
  getCrafts: async () => {
    const response = await fetch(`${API_GATEWAY_URL}/api/people/crafts`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch crafts');
    return response.json();
  },
};

// Safety API
export const safetyApi = {
  // Incidents
  incidents: {
    getAll: async () => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/incidents`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch incidents');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/incidents/${id}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch incident');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/incidents`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create incident');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/incidents/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update incident');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/incidents/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete incident');
      return response.json();
    },
  },

  // Precautions
  precautions: {
    getAll: async (filters?: { search?: string; category?: string; severity?: string; status?: string }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);
      
      const url = `${API_GATEWAY_URL}/api/safety/precautions${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch precautions');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/precautions/${id}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch precaution');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/precautions`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create precaution');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/precautions/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update precaution');
      return response.json();
    },

    incrementUsage: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/precautions/${id}/increment-usage`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to increment usage count');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/precautions/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete precaution');
      return response.json();
    },
  },

  // CAPA Records
  capa: {
    getAll: async () => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/capa`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch CAPA records');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/capa/${id}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch CAPA record');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/capa`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create CAPA record');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/capa/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update CAPA record');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/safety/capa/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete CAPA record');
      return response.json();
    },
  },
};

/**
 * Job Plans Service API
 */
export const jobPlansApi = {
  async getAll() {
    const response = await fetch(`${API_GATEWAY_URL}/api/job-plans`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch job plans');
    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch job plan');
    return response.json();
  },

  async create(jobPlan: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/job-plans`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(jobPlan),
    });
    if (!response.ok) throw new Error('Failed to create job plan');
    return response.json();
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update job plan');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete job plan');
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch job plan stats');
    return response.json();
  },

  // Task management
  tasks: {
    create: async (data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/tasks`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    
    update: async (id: string, data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/tasks/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/tasks/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
  },

  // Parts management
  parts: {
    create: async (data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/parts`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create part');
      return response.json();
    },
    
    update: async (id: string, data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/parts/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update part');
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/parts/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete part');
      return response.json();
    },
  },

  // Tools management
  tools: {
    create: async (data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/tools`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create tool');
      return response.json();
    },
    
    update: async (id: string, data: any) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/tools/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update tool');
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_GATEWAY_URL}/api/job-plans/tools/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete tool');
      return response.json();
    },
  },
};
