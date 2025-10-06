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

/**
 * PM Schedules Service API
 */
export const pmSchedulesApi = {
  async getAll() {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch PM schedules');
    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch PM schedule');
    return response.json();
  },

  async getByAsset(assetId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/by-asset/${assetId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch PM schedules for asset');
    return response.json();
  },

  async create(data: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create PM schedule');
    return response.json();
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update PM schedule');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete PM schedule');
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch PM schedule stats');
    return response.json();
  },

  async generateWorkOrder(scheduleId: string, dueDate: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/generate-work-order`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ dueDate }),
    });
    if (!response.ok) throw new Error('Failed to generate work order');
    return response.json();
  },

  async pause(scheduleId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/pause`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ pause: true }),
    });
    if (!response.ok) throw new Error('Failed to pause PM schedule');
    return response.json();
  },

  async resume(scheduleId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/pause`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ pause: false }),
    });
    if (!response.ok) throw new Error('Failed to resume PM schedule');
    return response.json();
  },

  // Materials management
  materials: {
    async getAll(scheduleId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/materials`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch materials');
      return response.json();
    },

    async create(scheduleId: string, data: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/materials`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create material');
      return response.json();
    },

    async update(materialId: string, data: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/materials/${materialId}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update material');
      return response.json();
    },

    async delete(materialId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/materials/${materialId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete material');
      return response.json();
    },
  },

  // Assignments management
  assignments: {
    async getAll(scheduleId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/assignments`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json();
    },

    async create(scheduleId: string, data: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/assignments`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create assignment');
      return response.json();
    },

    async bulkUpdate(scheduleId: string, personIds: string[]) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/assignments`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ assignedPersonIds: personIds }),
      });
      if (!response.ok) throw new Error('Failed to bulk update assignments');
      return response.json();
    },

    async delete(assignmentId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete assignment');
      return response.json();
    },
  },

  // History management
  history: {
    async getAll(scheduleId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/history`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },

    async create(scheduleId: string, data: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/pm-schedules/${scheduleId}/history`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create history record');
      return response.json();
    },
  },
};

/**
 * Meters Service API
 */
export const metersApi = {
  // ============ METERS OPERATIONS ============
  
  async getAll() {
    const response = await fetch(`${API_GATEWAY_URL}/api/meters`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch meters');
    const data = await response.json();
    return data.meters;
  },

  async getById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/meters/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch meter');
    const data = await response.json();
    return data.meter;
  },

  async create(meterData: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/meters`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(meterData),
    });
    if (!response.ok) throw new Error('Failed to create meter');
    const data = await response.json();
    return data.meter;
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/meters/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update meter');
    const data = await response.json();
    return data.meter;
  },

  async delete(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/meters/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete meter');
    return response.json();
  },

  // ============ GROUPS OPERATIONS ============
  
  groups: {
    async getAll() {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch meter groups');
      const data = await response.json();
      return data.groups;
    },

    async getById(id: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups/${id}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch meter group');
      const data = await response.json();
      return data.group;
    },

    async create(groupData: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(groupData),
      });
      if (!response.ok) throw new Error('Failed to create meter group');
      const data = await response.json();
      return data.group;
    },

    async update(id: string, updates: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update meter group');
      const data = await response.json();
      return data.group;
    },

    async delete(id: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete meter group');
      return response.json();
    },
  },

  // ============ ASSIGNMENTS OPERATIONS ============
  
  assignments: {
    async getForGroup(groupId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups/${groupId}/assignments`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      return data.assignments;
    },

    async create(groupId: string, assignmentData: any) {
      const response = await fetch(`${API_GATEWAY_URL}/api/groups/${groupId}/assignments`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });
      if (!response.ok) throw new Error('Failed to create assignment');
      const data = await response.json();
      return data.assignment;
    },

    async delete(assignmentId: string) {
      const response = await fetch(`${API_GATEWAY_URL}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete assignment');
      return response.json();
    },
  },
};

/**
 * Routes Service API
 */
export const routesApi = {
  async getAll() {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch routes');
    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch route');
    return response.json();
  },

  async create(data: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create route');
    return response.json();
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update route');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete route');
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch route stats');
    return response.json();
  },

  // Route assets management
  async getRouteAssets(routeId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${routeId}/assets`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch route assets');
    return response.json();
  },

  async addAsset(routeId: string, assetData: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${routeId}/assets`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to add asset to route');
    return response.json();
  },

  async updateAsset(assetId: string, updates: any) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/assets/${assetId}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update route asset');
    return response.json();
  },

  async removeAsset(assetId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/assets/${assetId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove asset from route');
    return response.json();
  },

  async reorderAssets(routeId: string, assetOrders: Array<{ id: string; sequence_order: number }>) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${routeId}/assets/reorder`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ assetOrders }),
    });
    if (!response.ok) throw new Error('Failed to reorder assets');
    return response.json();
  },

  // PM schedule assignments
  async getAssignments(routeId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${routeId}/pm-assignments`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch PM assignments');
    return response.json();
  },

  async assignPMSchedule(routeId: string, scheduleId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${routeId}/pm-assignments`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ scheduleId }),
    });
    if (!response.ok) throw new Error('Failed to assign PM schedule');
    return response.json();
  },

  async unassignPMSchedule(scheduleId: string) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/pm-assignments/${scheduleId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to unassign PM schedule');
    return response.json();
  },

  async bulkAssignPMSchedules(routeId: string, scheduleIds: string[]) {
    const response = await fetch(`${API_GATEWAY_URL}/api/routes/${routeId}/pm-assignments/bulk`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ scheduleIds }),
    });
    if (!response.ok) throw new Error('Failed to bulk assign PM schedules');
    return response.json();
  },
};

/**
 * Workflow Service API
 * Manages workflow templates, steps, states, and transitions
 */
export const workflowApi = {
  // ==================== Template Management ====================
  templates: {
    async getAll(module?: string) {
      const headers = await getAuthHeaders();
      const url = module 
        ? `${API_GATEWAY_URL}/api/workflows/templates?module=${module}`
        : `${API_GATEWAY_URL}/api/workflows/templates`;
      
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Failed to fetch workflow templates');
      return response.json();
    },

    async getById(templateId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch workflow template');
      return response.json();
    },

    async create(templateData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(templateData),
        }
      );
      if (!response.ok) throw new Error('Failed to create workflow template');
      return response.json();
    },

    async update(templateId: string, templateData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(templateData),
        }
      );
      if (!response.ok) throw new Error('Failed to update workflow template');
      return response.json();
    },

    async delete(templateId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (!response.ok) throw new Error('Failed to delete workflow template');
      return response.json();
    },

    async setDefault(templateId: string, module: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}/set-default`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ module }),
        }
      );
      if (!response.ok) throw new Error('Failed to set default template');
      return response.json();
    },

    async clone(templateId: string, newName: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}/clone`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: newName }),
        }
      );
      if (!response.ok) throw new Error('Failed to clone workflow template');
      return response.json();
    },

    async activate(templateId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}/activate`,
        {
          method: 'POST',
          headers,
        }
      );
      if (!response.ok) throw new Error('Failed to activate workflow template');
      return response.json();
    },
  },

  // ==================== Step Management ====================
  steps: {
    async getAll(templateId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}/steps`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch workflow steps');
      return response.json();
    },

    async create(templateId: string, stepData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/templates/${templateId}/steps`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(stepData),
        }
      );
      if (!response.ok) throw new Error('Failed to create workflow step');
      return response.json();
    },

    async update(stepId: string, stepData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/steps/${stepId}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(stepData),
        }
      );
      if (!response.ok) throw new Error('Failed to update workflow step');
      return response.json();
    },

    async delete(stepId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/steps/${stepId}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (!response.ok) throw new Error('Failed to delete workflow step');
      return response.json();
    },

    async getRoleAssignments(stepId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/steps/${stepId}/roles`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch step role assignments');
      return response.json();
    },

    async upsertRoleAssignment(stepId: string, roleData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/steps/${stepId}/roles`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(roleData),
        }
      );
      if (!response.ok) throw new Error('Failed to upsert role assignment');
      return response.json();
    },

    async getConditions(stepId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/steps/${stepId}/conditions`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch step conditions');
      return response.json();
    },
  },

  // ==================== State Management ====================
  state: {
    async getWorkOrderState(workOrderId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/work-orders/${workOrderId}/state`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch work order workflow state');
      return response.json();
    },

    async getIncidentState(incidentId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/incidents/${incidentId}/state`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch incident workflow state');
      return response.json();
    },

    async transitionWorkOrder(workOrderId: string, transitionData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/work-orders/${workOrderId}/transition`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(transitionData),
        }
      );
      if (!response.ok) throw new Error('Failed to transition work order workflow');
      return response.json();
    },

    async transitionIncident(incidentId: string, transitionData: any) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/incidents/${incidentId}/transition`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(transitionData),
        }
      );
      if (!response.ok) throw new Error('Failed to transition incident workflow');
      return response.json();
    },
  },

  // ==================== Analytics & Reporting ====================
  analytics: {
    async getWorkflowStats(module: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/analytics/stats?module=${module}`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch workflow stats');
      return response.json();
    },

    async getStepMetrics(templateId: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/analytics/steps/${templateId}`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch step metrics');
      return response.json();
    },

    async getBottlenecks(module: string) {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/analytics/bottlenecks?module=${module}`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch workflow bottlenecks');
      return response.json();
    },

    async getApprovalHistory(entityId: string, entityType: 'work_order' | 'incident') {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/analytics/approvals/${entityType}/${entityId}`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch approval history');
      return response.json();
    },
  },

  // ==================== Bulk Operations ====================
  bulk: {
    async initializeWorkflows(module: 'work_orders' | 'safety_incidents') {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/bulk/initialize`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ module }),
        }
      );
      if (!response.ok) throw new Error('Failed to bulk initialize workflows');
      return response.json();
    },

    async getStatus(module: 'work_orders' | 'safety_incidents') {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_GATEWAY_URL}/api/workflows/bulk/status?module=${module}`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch bulk workflow status');
      return response.json();
    },
  },
};
