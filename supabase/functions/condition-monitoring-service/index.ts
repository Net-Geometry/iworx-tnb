/**
 * Condition Monitoring Microservice
 * 
 * Orchestrates IoT sensor data, asset health monitoring, and threshold management.
 * Triggers corrective maintenance work orders when conditions exceed thresholds.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getOrCreateCorrelationId, logWithCorrelation } from "../_shared/correlation.ts";
import { EventBus, DomainEvents } from "../_shared/event-bus.ts";
import { createServiceClient } from "../_shared/service-client.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getOrCreateCorrelationId(req);
  const userId = req.headers.get("x-user-id");
  const organizationId = req.headers.get("x-organization-id");

  logWithCorrelation(correlationId, "condition-monitoring-service", "info", "Request received", {
    method: req.method,
    userId,
    organizationId,
  });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const eventBus = new EventBus("condition-monitoring-service");
    const url = new URL(req.url);
    const path = url.pathname.replace("/condition-monitoring-service", "");

    if (path === "/health") {
      return new Response(JSON.stringify({ status: "healthy" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /assets - Get all monitored assets
    if (path === "/assets" && req.method === "GET") {
      const params = url.searchParams;
      const status = params.get("status");

      const { data: devices } = await supabase
        .from("iot_devices")
        .select("id, device_name, asset_id, status, assets(id, name, asset_number, type, criticality)")
        .eq("organization_id", organizationId)
        .not("asset_id", "is", null);

      const assetsMap = new Map();
      for (const device of devices || []) {
        if (!device.assets) continue;
        const assetId = device.asset_id;
        if (!assetsMap.has(assetId)) {
          assetsMap.set(assetId, {
            ...device.assets,
            iot_devices: [],
            condition: "healthy",
            active_alarms_count: 0,
            alarms: [],
            latest_readings: [],
          });
        }
        assetsMap.get(assetId).iot_devices.push({
          id: device.id,
          device_name: device.device_name,
          status: device.status,
        });
      }

      const assets = Array.from(assetsMap.values());

      for (const asset of assets) {
        const { data: alarms } = await supabase
          .from("condition_alarms")
          .select("alarm_type, metric_name, triggered_value")
          .eq("asset_id", asset.id)
          .eq("status", "active")
          .order("alarm_type", { ascending: true });

        if (alarms && alarms.length > 0) {
          asset.condition = alarms[0].alarm_type;
          asset.active_alarms_count = alarms.length;
          asset.alarms = alarms;
        }

        const deviceIds = asset.iot_devices.map((d: any) => d.id);
        if (deviceIds.length > 0) {
          const { data: readings } = await supabase
            .from("iot_data")
            .select("metric_name, value, unit, timestamp")
            .in("device_id", deviceIds)
            .order("timestamp", { ascending: false })
            .limit(10);
          asset.latest_readings = readings || [];
        }
      }

      const filtered = status ? assets.filter((a) => a.condition === status) : assets;

      return new Response(JSON.stringify(filtered), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /assets/:id/status
    if (path.match(/^\/assets\/[^\/]+\/status$/) && req.method === "GET") {
      const assetId = path.split("/")[2];

      const { data: asset } = await supabase
        .from("assets")
        .select("*")
        .eq("id", assetId)
        .single();

      const { data: devices } = await supabase
        .from("iot_devices")
        .select("*")
        .eq("asset_id", assetId);

      const { data: alarms } = await supabase
        .from("condition_alarms")
        .select("*")
        .eq("asset_id", assetId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const { data: thresholds } = await supabase
        .from("condition_thresholds")
        .select("*")
        .eq("asset_id", assetId)
        .eq("enabled", true);

      const deviceIds = devices?.map((d) => d.id) || [];
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { data: recentReadings } = await supabase
        .from("iot_data")
        .select("*")
        .in("device_id", deviceIds)
        .gte("timestamp", oneDayAgo.toISOString())
        .order("timestamp", { ascending: false })
        .limit(100);

      const criticalAlarms = alarms?.filter((a) => a.alarm_type === "critical") || [];
      const warningAlarms = alarms?.filter((a) => a.alarm_type === "warning") || [];
      const condition = criticalAlarms.length > 0 ? "critical" : warningAlarms.length > 0 ? "warning" : "healthy";

      return new Response(JSON.stringify({
        asset,
        devices,
        condition,
        active_alarms: alarms || [],
        critical_alarms_count: criticalAlarms.length,
        warning_alarms_count: warningAlarms.length,
        thresholds: thresholds || [],
        recent_readings: recentReadings || [],
        last_update: recentReadings?.[0]?.timestamp || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /thresholds
    if (path === "/thresholds" && req.method === "GET") {
      const params = url.searchParams;
      const assetId = params.get("asset_id");
      const deviceId = params.get("device_id");

      let query = supabase
        .from("condition_thresholds")
        .select("*, assets(id, name, asset_number), iot_devices(id, device_name)")
        .eq("organization_id", organizationId);

      if (assetId) query = query.eq("asset_id", assetId);
      if (deviceId) query = query.eq("device_id", deviceId);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /thresholds
    if (path === "/thresholds" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("condition_thresholds")
        .insert({ ...body, organization_id: organizationId, created_by: userId })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /thresholds/:id
    if (path.match(/^\/thresholds\/[^\/]+$/) && req.method === "PUT") {
      const thresholdId = path.split("/")[2];
      const body = await req.json();
      const { data, error } = await supabase
        .from("condition_thresholds")
        .update(body)
        .eq("id", thresholdId)
        .eq("organization_id", organizationId)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /thresholds/:id
    if (path.match(/^\/thresholds\/[^\/]+$/) && req.method === "DELETE") {
      const thresholdId = path.split("/")[2];
      const { error } = await supabase
        .from("condition_thresholds")
        .delete()
        .eq("id", thresholdId)
        .eq("organization_id", organizationId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /alarms
    if (path === "/alarms" && req.method === "GET") {
      const params = url.searchParams;
      const status = params.get("status") || "active";
      const alarmType = params.get("alarm_type");
      const assetId = params.get("asset_id");

      let query = supabase
        .from("condition_alarms")
        .select("*, assets(id, name, asset_number), iot_devices(id, device_name)")
        .eq("organization_id", organizationId);

      if (status !== "all") query = query.eq("status", status);
      if (alarmType) query = query.eq("alarm_type", alarmType);
      if (assetId) query = query.eq("asset_id", assetId);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /alarms/:id/acknowledge
    if (path.match(/^\/alarms\/[^\/]+\/acknowledge$/) && req.method === "POST") {
      const alarmId = path.split("/")[2];
      const body = await req.json();
      const { data, error } = await supabase
        .from("condition_alarms")
        .update({
          status: "acknowledged",
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
          acknowledged_notes: body.notes || null,
        })
        .eq("id", alarmId)
        .eq("organization_id", organizationId)
        .select()
        .single();

      if (error) throw error;

      await eventBus.publish({
        eventType: DomainEvents.ALARM_ACKNOWLEDGED,
        correlationId,
        payload: {
          alarm_id: alarmId,
          asset_id: data.asset_id,
          acknowledged_by: userId,
          organization_id: organizationId,
        },
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /alarms/:id/create-work-order
    if (path.match(/^\/alarms\/[^\/]+\/create-work-order$/) && req.method === "POST") {
      const alarmId = path.split("/")[2];
      const body = await req.json();

      const { data: alarm } = await supabase
        .from("condition_alarms")
        .select("*, assets(id, name, asset_number), iot_devices(id, device_name)")
        .eq("id", alarmId)
        .single();

      if (!alarm) {
        return new Response(JSON.stringify({ error: "Alarm not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const workOrderService = createServiceClient("work-order-service", req);
      const workOrderData = {
        asset_id: alarm.asset_id,
        title: body.title || `${alarm.alarm_type.toUpperCase()}: ${alarm.metric_name} on ${alarm.assets.name}`,
        description: body.description || 
          `Corrective maintenance required.\n\nMetric: ${alarm.metric_name}\nValue: ${alarm.triggered_value}\nThreshold: ${alarm.threshold_value}`,
        maintenance_type: "corrective",
        priority: alarm.alarm_type === "critical" ? "critical" : "high",
        scheduled_date: new Date().toISOString(),
        organization_id: organizationId,
        generation_type: "automatic",
      };

      const workOrderResponse = await workOrderService.post("/", workOrderData);
      if (workOrderResponse.error) throw new Error(workOrderResponse.error);

      const workOrderId = (workOrderResponse.data as any)?.id;

      await supabase
        .from("condition_alarms")
        .update({
          work_order_id: workOrderId,
          work_order_created_at: new Date().toISOString(),
        })
        .eq("id", alarmId);

      await eventBus.publish({
        eventType: DomainEvents.WORK_ORDER_CREATED,
        correlationId,
        payload: {
          work_order_id: workOrderId,
          asset_id: alarm.asset_id,
          triggered_by: "condition_alarm",
          alarm_id: alarmId,
          maintenance_type: "corrective",
          organization_id: organizationId,
        },
      });

      return new Response(JSON.stringify({ alarm, work_order: workOrderResponse.data }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /alarms/:id/resolve
    if (path.match(/^\/alarms\/[^\/]+\/resolve$/) && req.method === "POST") {
      const alarmId = path.split("/")[2];
      const body = await req.json();
      const { data, error } = await supabase
        .from("condition_alarms")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolution_notes: body.notes || null,
        })
        .eq("id", alarmId)
        .eq("organization_id", organizationId)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /kpis
    if (path === "/kpis" && req.method === "GET") {
      const { data: devices } = await supabase
        .from("iot_devices")
        .select("asset_id")
        .eq("organization_id", organizationId)
        .not("asset_id", "is", null);

      const totalAssets = new Set(devices?.map(d => d.asset_id)).size;

      const { data: alarms } = await supabase
        .from("condition_alarms")
        .select("status, alarm_type, asset_id")
        .eq("organization_id", organizationId);

      const activeAlarms = alarms?.filter((a) => a.status === "active") || [];
      const criticalConditions = activeAlarms.filter((a) => a.alarm_type === "critical").length;
      const warningConditions = activeAlarms.filter((a) => a.alarm_type === "warning").length;
      const assetsWithAlarms = new Set(activeAlarms.map(a => a.asset_id)).size;
      const healthyAssets = totalAssets - assetsWithAlarms;

      const { data: recentReadings } = await supabase
        .from("iot_data")
        .select("timestamp")
        .eq("organization_id", organizationId)
        .order("timestamp", { ascending: false })
        .limit(100);

      let avgUpdateRate = "N/A";
      if (recentReadings && recentReadings.length > 1) {
        const timestamps = recentReadings.map((r) => new Date(r.timestamp).getTime());
        const intervals = timestamps.slice(0, -1).map((t, i) => t - timestamps[i + 1]);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        avgUpdateRate = `${Math.round(avgInterval / 1000)}s`;
      }

      return new Response(JSON.stringify({
        total_monitored_assets: totalAssets,
        critical_conditions: criticalConditions,
        warning_conditions: warningConditions,
        healthy_assets: healthyAssets,
        active_alarms: activeAlarms.length,
        avg_update_rate: avgUpdateRate,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logWithCorrelation(correlationId, "condition-monitoring-service", "error", "Error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
