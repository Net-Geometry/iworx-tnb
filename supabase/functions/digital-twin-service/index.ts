/**
 * Digital Twin Service
 * 
 * Microservice for 3D visualization, real-time IoT data, and what-if simulations
 * 
 * Endpoints:
 * - GET  /scene/{hierarchyNodeId}     - 3D scene data for hierarchy level
 * - GET  /iot/live                    - Live IoT readings (real-time)
 * - GET  /iot/historical              - Time-series historical sensor data
 * - POST /simulate                    - Run what-if scenarios
 * - GET  /incidents/{id}/playback     - Incident time-travel data
 * - GET  /health                      - Service health check
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/digital-twin-service/', '');
    
    // Extract auth headers from API Gateway
    const organizationId = req.headers.get('x-organization-id');
    const userId = req.headers.get('x-user-id');
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

    console.log(`[${correlationId}] Digital Twin Service: ${req.method} ${path}`, {
      organizationId,
      userId
    });

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Route handlers
    if (path === 'health' || path === '') {
      return new Response(
        JSON.stringify({
          service: 'digital-twin-service',
          status: 'healthy',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Require authentication for all other endpoints
    if (!organizationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing organization or user context' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /scene/{hierarchyNodeId}
    if (path.startsWith('scene/')) {
      return await handleSceneData(supabase, path, organizationId, correlationId);
    }

    // GET /iot/live
    if (path === 'iot/live') {
      return await handleLiveIoT(supabase, url, organizationId, correlationId);
    }

    // GET /iot/historical
    if (path === 'iot/historical') {
      return await handleHistoricalIoT(supabase, url, organizationId, correlationId);
    }

    // POST /simulate
    if (path === 'simulate' && req.method === 'POST') {
      return await handleSimulation(supabase, req, organizationId, userId, correlationId);
    }

    // GET /incidents/{id}/playback
    if (path.startsWith('incidents/') && path.endsWith('/playback')) {
      return await handleIncidentPlayback(supabase, path, organizationId, correlationId);
    }

    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Digital Twin Service] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * GET /scene/{hierarchyNodeId}
 * Returns 3D scene data for a specific hierarchy level
 */
async function handleSceneData(
  supabase: any,
  path: string,
  organizationId: string,
  correlationId: string
) {
  const hierarchyNodeId = path.split('/')[1];
  
  console.log(`[${correlationId}] Fetching scene data for node:`, hierarchyNodeId);

  // Fetch hierarchy node details
  const { data: node, error: nodeError } = await supabase
    .from('hierarchy_nodes')
    .select('*')
    .eq('id', hierarchyNodeId)
    .eq('organization_id', organizationId)
    .single();

  if (nodeError || !node) {
    return new Response(
      JSON.stringify({ error: 'Hierarchy node not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch assets at this hierarchy level with 3D model data
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select(`
      id,
      name,
      asset_number,
      type,
      category,
      subcategory,
      status,
      health_score,
      criticality,
      hierarchy_node_id,
      model_3d_url,
      model_3d_scale,
      model_3d_rotation
    `)
    .eq('hierarchy_node_id', hierarchyNodeId)
    .eq('organization_id', organizationId)
    .neq('status', 'decommissioned');

  if (assetsError) {
    console.error(`[${correlationId}] Error fetching assets:`, assetsError);
  }

  // Fetch latest IoT readings for these assets
  const assetIds = (assets || []).map((a: any) => a.id);
  let latestReadings: any = {};

  if (assetIds.length > 0) {
    const { data: readings } = await supabase
      .from('asset_sensor_readings')
      .select('*')
      .in('asset_id', assetIds)
      .eq('organization_id', organizationId)
      .order('timestamp', { ascending: false })
      .limit(5 * assetIds.length); // 5 readings per asset max

    if (readings) {
      readings.forEach((reading: any) => {
        if (!latestReadings[reading.asset_id]) {
          latestReadings[reading.asset_id] = [];
        }
        if (latestReadings[reading.asset_id].length < 5) {
          latestReadings[reading.asset_id].push(reading);
        }
      });
    }
  }

  // Fetch child nodes for navigation
  const { data: childNodes } = await supabase
    .from('hierarchy_nodes')
    .select('id, name, hierarchy_level_id')
    .eq('parent_id', hierarchyNodeId)
    .eq('organization_id', organizationId);

  const response = {
    node,
    assets: assets || [],
    latestReadings,
    childNodes: childNodes || [],
    metadata: {
      assetCount: (assets || []).length,
      childNodeCount: (childNodes || []).length,
      timestamp: new Date().toISOString()
    }
  };

  console.log(`[${correlationId}] Scene data fetched: ${response.metadata.assetCount} assets`);

  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * GET /iot/live?assetIds=uuid1,uuid2
 * Returns latest IoT readings for specified assets
 */
async function handleLiveIoT(
  supabase: any,
  url: URL,
  organizationId: string,
  correlationId: string
) {
  const assetIdsParam = url.searchParams.get('assetIds');
  
  if (!assetIdsParam) {
    return new Response(
      JSON.stringify({ error: 'assetIds parameter required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const assetIds = assetIdsParam.split(',');
  
  console.log(`[${correlationId}] Fetching live IoT for ${assetIds.length} assets`);

  const { data: readings, error } = await supabase
    .from('asset_sensor_readings')
    .select('*')
    .in('asset_id', assetIds)
    .eq('organization_id', organizationId)
    .order('timestamp', { ascending: false })
    .limit(10 * assetIds.length);

  if (error) {
    console.error(`[${correlationId}] Error fetching IoT data:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch IoT data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Group by asset
  const groupedReadings: any = {};
  (readings || []).forEach((reading: any) => {
    if (!groupedReadings[reading.asset_id]) {
      groupedReadings[reading.asset_id] = [];
    }
    if (groupedReadings[reading.asset_id].length < 10) {
      groupedReadings[reading.asset_id].push(reading);
    }
  });

  return new Response(
    JSON.stringify({ readings: groupedReadings, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * GET /iot/historical?assetId=uuid&startTime=ISO&endTime=ISO&sensorType=temperature
 * Returns time-series historical sensor data
 */
async function handleHistoricalIoT(
  supabase: any,
  url: URL,
  organizationId: string,
  correlationId: string
) {
  const assetId = url.searchParams.get('assetId');
  const startTime = url.searchParams.get('startTime');
  const endTime = url.searchParams.get('endTime');
  const sensorType = url.searchParams.get('sensorType');

  if (!assetId) {
    return new Response(
      JSON.stringify({ error: 'assetId parameter required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[${correlationId}] Fetching historical IoT for asset:`, assetId);

  let query = supabase
    .from('asset_sensor_readings')
    .select('*')
    .eq('asset_id', assetId)
    .eq('organization_id', organizationId)
    .order('timestamp', { ascending: true });

  if (startTime) {
    query = query.gte('timestamp', startTime);
  }
  if (endTime) {
    query = query.lte('timestamp', endTime);
  }
  if (sensorType) {
    query = query.eq('sensor_type', sensorType);
  }

  const { data: readings, error } = await query.limit(1000);

  if (error) {
    console.error(`[${correlationId}] Error fetching historical data:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch historical data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ readings: readings || [], count: (readings || []).length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * POST /simulate
 * Run what-if scenario simulation
 */
async function handleSimulation(
  supabase: any,
  req: Request,
  organizationId: string,
  userId: string,
  correlationId: string
) {
  const body = await req.json();
  const { name, description, scenarioType, parameters } = body;

  console.log(`[${correlationId}] Running simulation:`, scenarioType);

  // Create scenario record
  const { data: scenario, error: scenarioError } = await supabase
    .from('digital_twin_scenarios')
    .insert({
      name,
      description,
      scenario_type: scenarioType,
      parameters,
      organization_id: organizationId,
      created_by: userId
    })
    .select()
    .single();

  if (scenarioError || !scenario) {
    console.error(`[${correlationId}] Error creating scenario:`, scenarioError);
    return new Response(
      JSON.stringify({ error: 'Failed to create scenario' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Run simulation based on type
  const results = await runSimulationEngine(scenarioType, parameters, organizationId);

  // Store results
  const resultInserts = results.metrics.map((metric: any) => ({
    scenario_id: scenario.id,
    metric_name: metric.name,
    baseline_value: metric.baseline,
    simulated_value: metric.simulated,
    percentage_change: metric.change,
    unit: metric.unit,
    impact_description: metric.description
  }));

  await supabase
    .from('scenario_simulation_results')
    .insert(resultInserts);

  console.log(`[${correlationId}] Simulation complete:`, results.metrics.length, 'metrics');

  return new Response(
    JSON.stringify({ scenario, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Simulation Engine - Calculates what-if outcomes
 */
function runSimulationEngine(scenarioType: string, parameters: any, organizationId: string) {
  // Mock simulation logic - replace with actual business logic
  const baselineMetrics = {
    downtime_hours: 120,
    maintenance_cost: 50000,
    reliability_score: 85,
    response_time_minutes: 45
  };

  let metrics: any[] = [];

  if (scenarioType === 'maintenance') {
    // Simulate maintenance frequency change
    const frequencyChange = parameters.frequency_change || 0;
    metrics = [
      {
        name: 'Downtime Hours',
        baseline: baselineMetrics.downtime_hours,
        simulated: baselineMetrics.downtime_hours * (1 - frequencyChange * 0.1),
        change: -frequencyChange * 10,
        unit: 'hours',
        description: 'Projected reduction in annual downtime'
      },
      {
        name: 'Maintenance Cost',
        baseline: baselineMetrics.maintenance_cost,
        simulated: baselineMetrics.maintenance_cost * (1 + frequencyChange * 0.08),
        change: frequencyChange * 8,
        unit: 'USD',
        description: 'Increase in maintenance budget required'
      },
      {
        name: 'Reliability Score',
        baseline: baselineMetrics.reliability_score,
        simulated: baselineMetrics.reliability_score * (1 + frequencyChange * 0.05),
        change: frequencyChange * 5,
        unit: '%',
        description: 'Improvement in overall system reliability'
      }
    ];
  } else if (scenarioType === 'failure') {
    // Simulate equipment failure cascade
    metrics = [
      {
        name: 'Affected Assets',
        baseline: 1,
        simulated: parameters.cascade_factor || 3,
        change: 200,
        unit: 'assets',
        description: 'Number of dependent assets affected'
      },
      {
        name: 'Recovery Time',
        baseline: 2,
        simulated: 8,
        change: 300,
        unit: 'hours',
        description: 'Estimated time to restore full operations'
      }
    ];
  } else if (scenarioType === 'resource') {
    // Simulate resource optimization
    const resourceChange = parameters.resource_change || 0;
    metrics = [
      {
        name: 'Response Time',
        baseline: baselineMetrics.response_time_minutes,
        simulated: baselineMetrics.response_time_minutes * (1 - resourceChange * 0.15),
        change: -resourceChange * 15,
        unit: 'minutes',
        description: 'Reduction in average response time'
      },
      {
        name: 'Work Order Completion Rate',
        baseline: 75,
        simulated: 75 * (1 + resourceChange * 0.12),
        change: resourceChange * 12,
        unit: '%',
        description: 'Increase in on-time completion rate'
      }
    ];
  }

  return {
    metrics,
    recommendations: [
      'Review preventive maintenance schedules',
      'Consider additional technician training',
      'Implement predictive analytics for early detection'
    ],
    affectedAssets: parameters.asset_ids || []
  };
}

/**
 * GET /incidents/{id}/playback
 * Returns sensor data around incident time for time-travel feature
 */
async function handleIncidentPlayback(
  supabase: any,
  path: string,
  organizationId: string,
  correlationId: string
) {
  const incidentId = path.split('/')[1];
  
  console.log(`[${correlationId}] Fetching incident playback:`, incidentId);

  // Fetch incident details
  const { data: incident, error: incidentError } = await supabase
    .from('safety_incidents')
    .select('*')
    .eq('id', incidentId)
    .eq('organization_id', organizationId)
    .single();

  if (incidentError || !incident) {
    return new Response(
      JSON.stringify({ error: 'Incident not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get time window: 1 hour before incident, 10 minutes after
  const incidentTime = new Date(incident.incident_date);
  const startTime = new Date(incidentTime.getTime() - 60 * 60 * 1000).toISOString();
  const endTime = new Date(incidentTime.getTime() + 10 * 60 * 1000).toISOString();

  // Fetch sensor readings during incident window
  const { data: readings } = await supabase
    .from('asset_sensor_readings')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('timestamp', startTime)
    .lte('timestamp', endTime)
    .order('timestamp', { ascending: true });

  return new Response(
    JSON.stringify({
      incident,
      timeWindow: { start: startTime, end: endTime },
      readings: readings || [],
      incidentTimestamp: incident.incident_date
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
