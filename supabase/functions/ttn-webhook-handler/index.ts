/**
 * TTN Webhook Handler - Public endpoint for The Things Network uplink webhooks
 * 
 * Receives LoRaWAN uplink messages, decodes payloads, stores sensor data,
 * and creates meter readings if device is mapped to meters.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getOrCreateCorrelationId } from "../_shared/correlation.ts";
import { EventBus, DomainEvents } from "../_shared/event-bus.ts";
import { ServiceClient } from "../_shared/service-client.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Normalize DevEUI (uppercase, remove colons/spaces/dashes)
 */
function normalizeDevEui(devEui: string): string {
  return devEui.toUpperCase().replace(/[^A-F0-9]/g, "");
}

/**
 * Decode base64 payload to byte array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode payload using device type decoder config
 */
function decodePayload(
  payload: Uint8Array,
  decoderConfig: any
): Record<string, number> {
  const format = decoderConfig?.format || "json";

  if (format === "json") {
    // Assume payload is already decoded JSON from TTN
    return {};
  }

  if (format === "cayenne_lpp") {
    // Cayenne LPP decoder (simplified)
    const decoded: Record<string, number> = {};
    let i = 0;
    
    while (i < payload.length) {
      const channel = payload[i++];
      const type = payload[i++];
      
      // Temperature (0x67)
      if (type === 0x67 && i + 1 < payload.length) {
        const value = ((payload[i] << 8) | payload[i + 1]);
        decoded[`temperature_${channel}`] = value / 10.0;
        i += 2;
      }
      // Humidity (0x68)
      else if (type === 0x68 && i < payload.length) {
        decoded[`humidity_${channel}`] = payload[i] / 2.0;
        i += 1;
      }
      // Skip unknown types
      else {
        break;
      }
    }
    
    return decoded;
  }

  // Custom decoder function (eval from config)
  if (format === "custom" && decoderConfig?.decoder_function) {
    try {
      const decoderFn = new Function("bytes", decoderConfig.decoder_function);
      return decoderFn(Array.from(payload));
    } catch (error) {
      console.error("[TTN Webhook] Custom decoder error:", error);
      return {};
    }
  }

  return {};
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getOrCreateCorrelationId(req);
  console.log(`[TTN Webhook] Uplink received`, { correlationId });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const eventBus = new EventBus("ttn-webhook-handler");
    
    // Parse TTN webhook payload
    const body = await req.json();
    console.log("[TTN Webhook] Payload:", JSON.stringify(body, null, 2));

    // Extract fields from TTN uplink message
    const endDeviceIds = body.end_device_ids || {};
    const rawDevEui = endDeviceIds.dev_eui || endDeviceIds.device_id;
    const uplinkMessage = body.uplink_message || {};
    const frmPayload = uplinkMessage.frm_payload; // Base64 encoded
    const rxMetadata = uplinkMessage.rx_metadata || [];
    const settings = uplinkMessage.settings || {};

    if (!rawDevEui) {
      throw new Error("DevEUI not found in webhook payload");
    }

    // Normalize DevEUI
    const devEui = normalizeDevEui(rawDevEui);
    console.log("[TTN Webhook] Normalized DevEUI:", devEui);

    // Lookup device
    const { data: device, error: deviceError } = await supabase
      .from("iot_devices")
      .select(`
        *,
        device_type:iot_device_types(*)
      `)
      .eq("dev_eui", devEui)
      .eq("network_provider", "ttn")
      .single();

    if (deviceError || !device) {
      console.error("[TTN Webhook] Device not found:", devEui);
      return new Response(
        JSON.stringify({ error: "Device not registered" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[TTN Webhook] Device found:", device.device_name);

    // Decode payload
    let decodedData: Record<string, number> = {};
    
    // First check if TTN already decoded it
    if (uplinkMessage.decoded_payload) {
      decodedData = uplinkMessage.decoded_payload;
    } 
    // Otherwise decode from base64
    else if (frmPayload) {
      const payloadBytes = base64ToUint8Array(frmPayload);
      const decoderConfig = device.device_type?.decoder_config || {};
      decodedData = decodePayload(payloadBytes, decoderConfig);
    }

    console.log("[TTN Webhook] Decoded data:", decodedData);

    // Extract LoRaWAN metadata
    const gateway = rxMetadata[0] || {};
    const lorawanMetadata = {
      rssi: gateway.rssi,
      snr: gateway.snr,
      spreading_factor: settings.data_rate?.lora?.spreading_factor,
      gateway_id: gateway.gateway_ids?.gateway_id,
      gateway_location: gateway.location
        ? { lat: gateway.location.latitude, lon: gateway.location.longitude }
        : null,
    };

    // Get sensor schema from device type
    const sensorSchema = device.device_type?.sensor_schema?.measures || {};

    // Insert IoT data records (one per metric)
    const iotDataRecords = [];
    for (const [metricName, value] of Object.entries(decodedData)) {
      const metricConfig = sensorSchema[metricName] || {};
      
      iotDataRecords.push({
        device_id: device.id,
        metric_name: metricName,
        value: value,
        unit: metricConfig.unit || null,
        timestamp: new Date().toISOString(),
        lorawan_metadata: lorawanMetadata,
        organization_id: device.organization_id,
      });
    }

    if (iotDataRecords.length > 0) {
      const { error: insertError } = await supabase
        .from("iot_data")
        .insert(iotDataRecords);

      if (insertError) {
        console.error("[TTN Webhook] Error inserting IoT data:", insertError);
        throw insertError;
      }

      console.log(`[TTN Webhook] Inserted ${iotDataRecords.length} IoT data records`);
    }

    // Check for meter mappings
    const { data: mappings, error: mappingsError } = await supabase
      .from("iot_device_meter_mappings")
      .select(`
        *,
        meter:meters(*)
      `)
      .eq("device_id", device.id)
      .eq("is_active", true);

    if (!mappingsError && mappings && mappings.length > 0) {
      console.log(`[TTN Webhook] Found ${mappings.length} meter mappings`);

      // Create meter readings via meters-service
      const serviceClient = new ServiceClient({
        serviceName: "ttn-webhook-handler",
        correlationId,
        organizationId: device.organization_id,
      });

      for (const mapping of mappings) {
        const metricMapping = mapping.metric_mapping || {};
        const sourceMetric = metricMapping.source_metric;
        const sourceValue = decodedData[sourceMetric];

        if (sourceValue !== undefined) {
          // Apply transformations
          const multiplier = metricMapping.multiplier || 1.0;
          const offset = metricMapping.offset || 0.0;
          const transformedValue = sourceValue * multiplier + offset;

          // Check thresholds
          const minValue = metricMapping.min_value;
          const maxValue = metricMapping.max_value;
          let qualityCode = "GOOD";

          if (
            (minValue !== undefined && transformedValue < minValue) ||
            (maxValue !== undefined && transformedValue > maxValue)
          ) {
            qualityCode = "OUT_OF_RANGE";
            console.log(
              `[TTN Webhook] Value out of range for meter ${mapping.meter_id}`
            );
          }

          // Create meter reading (placeholder - adjust to your meters API)
          const readingPayload = {
            meter_id: mapping.meter_id,
            reading_value: transformedValue,
            reading_date: new Date().toISOString(),
            source_type: "iot",
            source_device_id: device.id,
            quality_code: qualityCode,
            notes: `Auto-generated from IoT device ${device.device_name}`,
          };

          console.log("[TTN Webhook] Creating meter reading:", readingPayload);

          // Call meters-service (adjust endpoint as needed)
          // await serviceClient.post("/meters/readings", readingPayload);
        }
      }
    }

    // Update device last_seen_at
    await supabase
      .from("iot_devices")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", device.id);

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.DEVICE_DATA_RECEIVED,
      correlationId,
      payload: {
        device_id: device.id,
        organization_id: device.organization_id,
        metrics: Object.keys(decodedData),
        data_points: iotDataRecords.length,
      },
    });

    console.log("[TTN Webhook] Processing complete");

    return new Response(
      JSON.stringify({ success: true, records_created: iotDataRecords.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[TTN Webhook] Error:", error);
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
