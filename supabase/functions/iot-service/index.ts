/**
 * IoT Service - Microservice for LoRaWAN Device Management
 * 
 * Handles CRUD operations for:
 * - IoT devices
 * - Device types
 * - Meter mappings
 * - Device health monitoring
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getOrCreateCorrelationId } from "../_shared/correlation.ts";
import { EventBus, DomainEvents } from "../_shared/event-bus.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = req.headers.get("x-correlation-id") || getOrCreateCorrelationId(req);
  const userId = req.headers.get("x-user-id");
  const organizationId = req.headers.get("x-organization-id");

  console.log(`[IoT Service] Request received`, {
    method: req.method,
    correlationId,
    userId,
    organizationId,
  });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const eventBus = new EventBus("iot-service");
    const url = new URL(req.url);
    const path = url.pathname.replace("/iot-service", "");

    // Health check
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "healthy" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // Device Endpoints
    // ============================================

    // GET /devices - List devices
    if (path === "/devices" && req.method === "GET") {
      const params = url.searchParams;
      let query = supabase
        .from("iot_devices")
        .select(`
          *,
          device_type:iot_device_types(*),
          asset:assets(id, name, asset_number)
        `)
        .order("created_at", { ascending: false });

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      if (params.get("asset_id")) {
        query = query.eq("asset_id", params.get("asset_id"));
      }
      if (params.get("status")) {
        query = query.eq("status", params.get("status"));
      }
      if (params.get("device_type_id")) {
        query = query.eq("device_type_id", params.get("device_type_id"));
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /devices/:id/metrics - Discover available metrics (must come before generic /devices/:id)
    if (req.method === 'GET' && path.match(/^\/devices\/[^\/]+\/metrics$/)) {
      const deviceId = path.split('/')[2];
      console.log(`[IoT Service] Fetching metrics for device: ${deviceId}, org: ${organizationId}`);
      
      const { data, error } = await supabase
        .from('iot_data')
        .select('metric_name')
        .eq('device_id', deviceId)
        .eq('organization_id', organizationId)
        .limit(1000);
      
      if (error) {
        console.error(`[IoT Service] Error fetching metrics:`, error);
        throw error;
      }
      
      const uniqueMetrics = [...new Set(data.map(d => d.metric_name))];
      console.log(`[IoT Service] Found ${uniqueMetrics.length} unique metrics:`, uniqueMetrics);
      
      return new Response(JSON.stringify(uniqueMetrics), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // GET /devices/:id/display-preferences (must come before generic /devices/:id)
    if (req.method === 'GET' && path.match(/^\/devices\/[^\/]+\/display-preferences$/)) {
      const deviceId = path.split('/')[2];
      console.log(`[IoT Service] Fetching display preferences for device: ${deviceId}, user: ${userId}`);
      
      const { data, error } = await supabase
        .from('iot_device_display_preferences')
        .select('*')
        .eq('device_id', deviceId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      const preferences = data || { 
        selected_metrics: [], 
        lorawan_fields: ['rssi', 'snr'], 
        refresh_interval_seconds: 30, 
        max_readings_shown: 50 
      };
      
      return new Response(JSON.stringify(preferences), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // GET /devices/:id - Get device details
    if (path.startsWith("/devices/") && req.method === "GET" && !path.includes("/data") && !path.includes("/health")) {
      const deviceId = path.split("/")[2];

      // Fetch device with device_type relationship
      const { data: device, error } = await supabase
        .from("iot_devices")
        .select(`
          *,
          device_type:iot_device_types(*)
        `)
        .eq("id", deviceId)
        .single();

      if (error) throw error;

      // If device has asset_id, fetch asset separately (more resilient to missing FK)
      if (device?.asset_id) {
        const { data: asset } = await supabase
          .from("assets")
          .select("id, name, asset_number")
          .eq("id", device.asset_id)
          .single();
        
        if (asset) {
          device.asset = asset;
        }
      }

      return new Response(JSON.stringify(device), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /devices - Create device
    if (path === "/devices" && req.method === "POST") {
      const body = await req.json();

      // Normalize DevEUI (uppercase, remove special chars)
      const normalizedDevEui = body.dev_eui
        .toUpperCase()
        .replace(/[^A-F0-9]/g, "");

      if (normalizedDevEui.length < 14 || normalizedDevEui.length > 16) {
        throw new Error("DevEUI must be 14-16 hexadecimal characters");
      }

      // Normalize App EUI if provided
      let normalizedAppEui = body.app_eui;
      if (normalizedAppEui) {
        normalizedAppEui = normalizedAppEui
          .toUpperCase()
          .replace(/[^A-F0-9]/g, "");
        
        if (normalizedAppEui.length < 14 || normalizedAppEui.length > 16) {
          throw new Error("App EUI must be 14-16 hexadecimal characters");
        }
      }

      const deviceData = {
        ...body,
        dev_eui: normalizedDevEui,
        app_eui: normalizedAppEui,
        organization_id: organizationId,
        created_by: userId,
      };

      const { data, error } = await supabase
        .from("iot_devices")
        .insert(deviceData)
        .select()
        .single();

      if (error) throw error;

      // Publish event
      await eventBus.publish({
        eventType: DomainEvents.DEVICE_REGISTERED,
        correlationId,
        payload: {
          device_id: data.id,
          organization_id: organizationId,
          device_name: data.device_name,
        },
      });

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /devices/:id - Update device
    if (path.startsWith("/devices/") && req.method === "PUT") {
      const deviceId = path.split("/")[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from("iot_devices")
        .update(body)
        .eq("id", deviceId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /devices/:id - Delete device
    if (path.startsWith("/devices/") && req.method === "DELETE") {
      const deviceId = path.split("/")[2];

      const { error } = await supabase
        .from("iot_devices")
        .delete()
        .eq("id", deviceId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /devices/:id/data - Get recent readings
    if (path.includes("/data") && req.method === "GET") {
      const deviceId = path.split("/")[2];
      const limit = url.searchParams.get("limit") || "100";

      const { data, error } = await supabase
        .from("iot_data")
        .select("*")
        .eq("device_id", deviceId)
        .order("timestamp", { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /devices/:id/health - Device health status
    if (path.includes("/health") && req.method === "GET") {
      const deviceId = path.split("/")[2];

      // Get device
      const { data: device, error: deviceError } = await supabase
        .from("iot_devices")
        .select("*")
        .eq("id", deviceId)
        .single();

      if (deviceError) throw deviceError;

      // Get latest readings
      const { data: latestReadings, error: readingsError } = await supabase
        .from("iot_data")
        .select("*")
        .eq("device_id", deviceId)
        .order("timestamp", { ascending: false })
        .limit(10);

      if (readingsError) throw readingsError;

      // Calculate health metrics
      const now = new Date();
      const lastSeen = device.last_seen_at ? new Date(device.last_seen_at) : null;
      const minutesSinceLastSeen = lastSeen
        ? Math.floor((now.getTime() - lastSeen.getTime()) / 60000)
        : null;

      const health = {
        device_id: deviceId,
        status: device.status,
        last_seen_at: device.last_seen_at,
        minutes_since_last_seen: minutesSinceLastSeen,
        is_online: minutesSinceLastSeen !== null && minutesSinceLastSeen < 60,
        recent_readings_count: latestReadings.length,
        latest_reading: latestReadings[0] || null,
      };

      return new Response(JSON.stringify(health), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // Device Type Endpoints
    // ============================================

    // GET /device-types - List device types
    if (path === "/device-types" && req.method === "GET") {
      let query = supabase
        .from("iot_device_types")
        .select("*")
        .order("name");

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /device-types - Create device type
    if (path === "/device-types" && req.method === "POST") {
      const body = await req.json();

      const deviceTypeData = {
        ...body,
        organization_id: organizationId,
        created_by: userId,
      };

      const { data, error } = await supabase
        .from("iot_device_types")
        .insert(deviceTypeData)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /device-types/:id - Update device type
    if (path.startsWith("/device-types/") && req.method === "PUT") {
      const typeId = path.split("/")[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from("iot_device_types")
        .update(body)
        .eq("id", typeId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /device-types/:id - Delete device type
    if (path.startsWith("/device-types/") && req.method === "DELETE") {
      const typeId = path.split("/")[2];

      const { error } = await supabase
        .from("iot_device_types")
        .delete()
        .eq("id", typeId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // Meter Mapping Endpoints
    // ============================================

    // GET /meter-mappings - List meter mappings
    if (path === "/meter-mappings" && req.method === "GET") {
      const params = url.searchParams;
      let query = supabase
        .from("iot_device_meter_mappings")
        .select(`
          *,
          device:iot_devices(id, device_name),
          meter:meters(id, meter_name)
        `);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      if (params.get("device_id")) {
        query = query.eq("device_id", params.get("device_id"));
      }
      if (params.get("meter_id")) {
        query = query.eq("meter_id", params.get("meter_id"));
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /meter-mappings - Create meter mapping
    if (path === "/meter-mappings" && req.method === "POST") {
      const body = await req.json();

      const mappingData = {
        ...body,
        organization_id: organizationId,
      };

      const { data, error } = await supabase
        .from("iot_device_meter_mappings")
        .insert(mappingData)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /meter-mappings/:id - Update meter mapping
    if (path.startsWith("/meter-mappings/") && req.method === "PUT") {
      const mappingId = path.split("/")[2];
      const body = await req.json();

      const { data, error } = await supabase
        .from("iot_device_meter_mappings")
        .update(body)
        .eq("id", mappingId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /meter-mappings/:id - Delete meter mapping
    if (path.startsWith("/meter-mappings/") && req.method === "DELETE") {
      const mappingId = path.split("/")[2];

      const { error } = await supabase
        .from("iot_device_meter_mappings")
        .delete()
        .eq("id", mappingId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Metrics and display-preferences endpoints moved up to line ~87 for proper precedence

    // PUT /devices/:id/display-preferences
    if (req.method === 'PUT' && path.match(/^\/devices\/[^\/]+\/display-preferences$/)) {
      const deviceId = path.split('/')[2];
      const body = await req.json();
      const { data, error } = await supabase.from('iot_device_display_preferences').upsert({ device_id: deviceId, user_id: userId, organization_id: organizationId, selected_metrics: body.selected_metrics || [], lorawan_fields: body.lorawan_fields || ['rssi', 'snr'], refresh_interval_seconds: body.refresh_interval_seconds || 30, max_readings_shown: body.max_readings_shown || 50 }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[IoT Service] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
