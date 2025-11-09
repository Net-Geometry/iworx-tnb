/**
 * Routes Service - Microservice for Maintenance Routes Management
 * 
 * Handles all operations related to maintenance routes, route assets,
 * and PM schedule assignments to routes.
 * 
 * Architecture:
 * - Service-oriented architecture with event bus integration
 * - Cross-schema database access (workorder_service, assets_service)
 * - Correlation ID tracking for distributed tracing
 * - Comprehensive logging for debugging
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { createEventBus, DomainEvents } from "../_shared/event-bus.ts";
import {
  getOrCreateCorrelationId,
  logWithCorrelation,
} from "../_shared/correlation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize service client with service role for cross-schema access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize event bus for domain events
const eventBus = createEventBus("routes-service");

const SERVICE_NAME = "routes-service";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getOrCreateCorrelationId(req);
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/routes-service\/?/, "");
    const method = req.method;

    // Extract auth context from headers (set by API Gateway)
    const userId = req.headers.get("x-user-id");
    const organizationId = req.headers.get("x-organization-id");
    const hasCrossProjectAccess = req.headers.get("x-cross-project-access") === "true";

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `${method} ${path}`,
      { userId, organizationId, hasCrossProjectAccess }
    );

    // Health check endpoint
    if (path === "health" && method === "GET") {
      return new Response(
        JSON.stringify({ status: "healthy", service: SERVICE_NAME }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate authentication
    if (!userId || !organizationId) {
      logWithCorrelation(
        correlationId,
        SERVICE_NAME,
        "warn",
        "Missing authentication headers",
        { path, method }
      );
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route handling
    const pathParts = path.split("/").filter(Boolean);

    // GET /routes - List all routes
    if (pathParts.length === 0 && method === "GET") {
      return await handleGetRoutes(organizationId, hasCrossProjectAccess, correlationId);
    }

    // GET /routes/stats - Get route statistics
    if (pathParts[0] === "stats" && method === "GET") {
      return await handleGetRouteStats(organizationId, hasCrossProjectAccess, correlationId);
    }

    // POST /routes - Create new route
    if (pathParts.length === 0 && method === "POST") {
      const body = await req.json();
      return await handleCreateRoute(body, organizationId, userId, correlationId);
    }

    // GET /routes/:id - Get single route
    if (pathParts.length === 1 && method === "GET") {
      const routeId = pathParts[0];
      return await handleGetRoute(routeId, organizationId, hasCrossProjectAccess, correlationId);
    }

    // PATCH /routes/:id - Update route
    if (pathParts.length === 1 && method === "PATCH") {
      const routeId = pathParts[0];
      const body = await req.json();
      return await handleUpdateRoute(routeId, body, organizationId, hasCrossProjectAccess, userId, correlationId);
    }

    // DELETE /routes/:id - Delete route
    if (pathParts.length === 1 && method === "DELETE") {
      const routeId = pathParts[0];
      return await handleDeleteRoute(routeId, organizationId, hasCrossProjectAccess, correlationId);
    }

    // GET /routes/:routeId/assets - Get route assets
    if (pathParts.length === 2 && pathParts[1] === "assets" && method === "GET") {
      const routeId = pathParts[0];
      return await handleGetRouteAssets(routeId, organizationId, hasCrossProjectAccess, correlationId);
    }

    // POST /routes/:routeId/assets - Add asset to route
    if (pathParts.length === 2 && pathParts[1] === "assets" && method === "POST") {
      const routeId = pathParts[0];
      const body = await req.json();
      return await handleAddAssetToRoute(routeId, body, organizationId, hasCrossProjectAccess, userId, correlationId);
    }

    // POST /routes/:routeId/assets/reorder - Reorder assets
    if (pathParts.length === 3 && pathParts[1] === "assets" && pathParts[2] === "reorder" && method === "POST") {
      const routeId = pathParts[0];
      const body = await req.json();
      return await handleReorderAssets(routeId, body, organizationId, hasCrossProjectAccess, correlationId);
    }

    // PATCH /routes/:routeId/assets/:assetId - Update route asset
    if (pathParts.length === 3 && pathParts[1] === "assets" && method === "PATCH") {
      const routeId = pathParts[0];
      const assetId = pathParts[2];
      const body = await req.json();
      return await handleUpdateRouteAsset(routeId, assetId, body, organizationId, hasCrossProjectAccess, correlationId);
    }

    // DELETE /routes/:routeId/assets/:assetId - Remove asset from route
    if (pathParts.length === 3 && pathParts[1] === "assets" && method === "DELETE") {
      const routeId = pathParts[0];
      const assetId = pathParts[2];
      return await handleRemoveAssetFromRoute(routeId, assetId, organizationId, hasCrossProjectAccess, correlationId);
    }

    // GET /routes/:routeId/assignments - Get PM schedule assignments
    if (pathParts.length === 2 && pathParts[1] === "assignments" && method === "GET") {
      const routeId = pathParts[0];
      return await handleGetRouteAssignments(routeId, organizationId, hasCrossProjectAccess, correlationId);
    }

    // POST /routes/:routeId/assignments - Assign PM schedule to route
    if (pathParts.length === 2 && pathParts[1] === "assignments" && method === "POST") {
      const routeId = pathParts[0];
      const body = await req.json();
      return await handleAssignPMSchedule(routeId, body, organizationId, hasCrossProjectAccess, correlationId);
    }

    // POST /routes/:routeId/assignments/bulk - Bulk assign PM schedules
    if (pathParts.length === 3 && pathParts[1] === "assignments" && pathParts[2] === "bulk" && method === "POST") {
      const routeId = pathParts[0];
      const body = await req.json();
      return await handleBulkAssignPMSchedules(routeId, body, organizationId, hasCrossProjectAccess, correlationId);
    }

    // DELETE /routes/:routeId/assignments/:scheduleId - Unassign PM schedule
    if (pathParts.length === 3 && pathParts[1] === "assignments" && method === "DELETE") {
      const routeId = pathParts[0];
      const scheduleId = pathParts[2];
      return await handleUnassignPMSchedule(routeId, scheduleId, organizationId, hasCrossProjectAccess, correlationId);
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: "Route not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const err = error as Error;
    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "error",
      "Unhandled error in routes service",
      { error: err.message, stack: err.stack }
    );

    return new Response(
      JSON.stringify({ error: "Internal server error", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * GET /routes - List all routes with enrichment
 */
async function handleGetRoutes(
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    let query = supabase
      .from("maintenance_routes")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by organization unless user has cross-project access
    if (!hasCrossProjectAccess) {
      query = query.eq("organization_id", organizationId);
    }

    const { data: routes, error } = await query;

    if (error) throw error;

    // Enrich routes with asset counts
    const enrichedRoutes = await Promise.all(
      routes.map(async (route) => {
        const { count } = await supabase
          .from("route_assets")
          .select("*", { count: "exact", head: true })
          .eq("route_id", route.id);

        return {
          ...route,
          asset_count: count || 0,
        };
      })
    );

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Retrieved ${enrichedRoutes.length} routes`
    );

    return new Response(
      JSON.stringify(enrichedRoutes),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to get routes", { error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to retrieve routes", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /routes/stats - Get route statistics
 */
async function handleGetRouteStats(
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    let routeQuery = supabase
      .from("maintenance_routes")
      .select("id, status");

    if (!hasCrossProjectAccess) {
      routeQuery = routeQuery.eq("organization_id", organizationId);
    }

    const { data: routes, error: routeError } = await routeQuery;
    if (routeError) throw routeError;

    const totalRoutes = routes.length;
    const activeRoutes = routes.filter((r) => r.status === "active").length;

    // Get total assets across all routes
    let assetsQuery = supabase
      .from("route_assets")
      .select("id", { count: "exact", head: true });

    if (!hasCrossProjectAccess) {
      const routeIds = routes.map((r) => r.id);
      assetsQuery = assetsQuery.in("route_id", routeIds);
    }

    const { count: totalAssets } = await assetsQuery;

    // Get routes with PM assignments
    let pmQuery = supabase
      .from("pm_schedules")
      .select("route_id")
      .not("route_id", "is", null);

    if (!hasCrossProjectAccess) {
      pmQuery = pmQuery.eq("organization_id", organizationId);
    }

    const { data: pmAssignments, error: pmError } = await pmQuery;
    if (pmError) throw pmError;

    const routesWithPM = new Set(pmAssignments.map((pm) => pm.route_id)).size;

    const stats = {
      totalRoutes,
      activeRoutes,
      totalAssets: totalAssets || 0,
      routesWithPMAssignments: routesWithPM,
    };

    logWithCorrelation(correlationId, SERVICE_NAME, "info", "Retrieved route stats", stats);

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to get route stats", { error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to retrieve route statistics", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /routes/:id - Get single route by ID
 */
async function handleGetRoute(
  routeId: string,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    let query = supabase
      .from("maintenance_routes")
      .select("*")
      .eq("id", routeId)
      .single();

    const { data: route, error } = await query;

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Route not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    // Check organization access
    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied to this route" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enrich with asset count
    const { count } = await supabase
      .from("route_assets")
      .select("*", { count: "exact", head: true })
      .eq("route_id", routeId);

    const enrichedRoute = {
      ...route,
      asset_count: count || 0,
    };

    logWithCorrelation(correlationId, SERVICE_NAME, "info", `Retrieved route ${routeId}`);

    return new Response(
      JSON.stringify(enrichedRoute),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to get route", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to retrieve route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /routes - Create new route
 */
async function handleCreateRoute(
  body: any,
  organizationId: string,
  userId: string,
  correlationId: string
) {
  try {
    const routeData = {
      ...body,
      organization_id: organizationId,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: route, error } = await supabase
      .from("maintenance_routes")
      .insert(routeData)
      .select()
      .single();

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_CREATED,
      payload: {
        routeId: route.id,
        organizationId,
        createdBy: userId,
        routeData: route,
      },
      correlationId,
    });

    logWithCorrelation(correlationId, SERVICE_NAME, "info", `Created route ${route.id}`);

    return new Response(
      JSON.stringify(route),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to create route", { error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to create route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * PATCH /routes/:id - Update route
 */
async function handleUpdateRoute(
  routeId: string,
  updates: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  userId: string,
  correlationId: string
) {
  try {
    // Verify route exists and user has access
    const { data: existingRoute, error: fetchError } = await supabase
      .from("maintenance_routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !existingRoute) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && existingRoute.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update route
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.organization_id;
    delete updateData.created_by;
    delete updateData.created_at;

    const { data: route, error } = await supabase
      .from("maintenance_routes")
      .update(updateData)
      .eq("id", routeId)
      .select()
      .single();

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_UPDATED,
      payload: {
        routeId,
        organizationId: existingRoute.organization_id,
        updatedBy: userId,
        updates: updateData,
        routeData: route,
      },
      correlationId,
    });

    logWithCorrelation(correlationId, SERVICE_NAME, "info", `Updated route ${routeId}`);

    return new Response(
      JSON.stringify(route),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to update route", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to update route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * DELETE /routes/:id - Delete route
 */
async function handleDeleteRoute(
  routeId: string,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route exists and user has access
    const { data: existingRoute, error: fetchError } = await supabase
      .from("maintenance_routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !existingRoute) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && existingRoute.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unassign all PM schedules first
    await supabase
      .from("pm_schedules")
      .update({ route_id: null })
      .eq("route_id", routeId);

    // Delete route assets
    await supabase
      .from("route_assets")
      .delete()
      .eq("route_id", routeId);

    // Delete route
    const { error } = await supabase
      .from("maintenance_routes")
      .delete()
      .eq("id", routeId);

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_DELETED,
      payload: {
        routeId,
        organizationId: existingRoute.organization_id,
        routeData: existingRoute,
      },
      correlationId,
    });

    logWithCorrelation(correlationId, SERVICE_NAME, "info", `Deleted route ${routeId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Route deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to delete route", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to delete route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /routes/:routeId/assets - Get route assets with enrichment
 */
async function handleGetRouteAssets(
  routeId: string,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get route assets
    const { data: routeAssets, error } = await supabase
      .from("route_assets")
      .select("*")
      .eq("route_id", routeId)
      .order("sequence_order", { ascending: true });

    if (error) throw error;

    // Enrich with asset details
    const enrichedAssets = await Promise.all(
      routeAssets.map(async (routeAsset) => {
        const { data: asset } = await supabase
          .from("assets_service.assets")
          .select("id, asset_number, name, status, criticality")
          .eq("id", routeAsset.asset_id)
          .single();

        return {
          ...routeAsset,
          asset,
        };
      })
    );

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Retrieved ${enrichedAssets.length} assets for route ${routeId}`
    );

    return new Response(
      JSON.stringify(enrichedAssets),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to get route assets", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to retrieve route assets", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /routes/:routeId/assets - Add asset to route
 */
async function handleAddAssetToRoute(
  routeId: string,
  body: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  userId: string,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get next sequence order
    const { data: existingAssets } = await supabase
      .from("route_assets")
      .select("sequence_order")
      .eq("route_id", routeId)
      .order("sequence_order", { ascending: false })
      .limit(1);

    const nextSequence = existingAssets && existingAssets.length > 0
      ? existingAssets[0].sequence_order + 1
      : 1;

    // Add asset to route
    const routeAssetData = {
      route_id: routeId,
      asset_id: body.asset_id,
      sequence_order: body.sequence_order || nextSequence,
      estimated_time_minutes: body.estimated_time_minutes,
      notes: body.notes,
      organization_id: route.organization_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: routeAsset, error } = await supabase
      .from("route_assets")
      .insert(routeAssetData)
      .select()
      .single();

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_ASSET_ADDED,
      payload: {
        routeId,
        assetId: body.asset_id,
        organizationId: route.organization_id,
        addedBy: userId,
        routeAssetData: routeAsset,
      },
      correlationId,
    });

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Added asset ${body.asset_id} to route ${routeId}`
    );

    return new Response(
      JSON.stringify(routeAsset),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to add asset to route", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to add asset to route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /routes/:routeId/assets/reorder - Reorder assets in route
 */
async function handleReorderAssets(
  routeId: string,
  body: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update sequence order for each asset
    const { assets } = body; // Array of { id, sequence_order }

    const updates = await Promise.all(
      assets.map(async (asset: any) => {
        const { data, error } = await supabase
          .from("route_assets")
          .update({
            sequence_order: asset.sequence_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", asset.id)
          .eq("route_id", routeId)
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_ASSET_REORDERED,
      payload: {
        routeId,
        organizationId: route.organization_id,
        reorderedAssets: updates,
      },
      correlationId,
    });

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Reordered ${assets.length} assets in route ${routeId}`
    );

    return new Response(
      JSON.stringify({ success: true, assets: updates }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to reorder assets", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to reorder assets", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * PATCH /routes/:routeId/assets/:assetId - Update route asset
 */
async function handleUpdateRouteAsset(
  routeId: string,
  assetId: string,
  updates: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update route asset
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    delete updateData.id;
    delete updateData.route_id;
    delete updateData.asset_id;
    delete updateData.organization_id;

    const { data: routeAsset, error } = await supabase
      .from("route_assets")
      .update(updateData)
      .eq("id", assetId)
      .eq("route_id", routeId)
      .select()
      .single();

    if (error) throw error;

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Updated route asset ${assetId} in route ${routeId}`
    );

    return new Response(
      JSON.stringify(routeAsset),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to update route asset", { routeId, assetId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to update route asset", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * DELETE /routes/:routeId/assets/:assetId - Remove asset from route
 */
async function handleRemoveAssetFromRoute(
  routeId: string,
  assetId: string,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get route asset details before deletion
    const { data: routeAsset } = await supabase
      .from("route_assets")
      .select("*")
      .eq("id", assetId)
      .eq("route_id", routeId)
      .single();

    // Delete route asset
    const { error } = await supabase
      .from("route_assets")
      .delete()
      .eq("id", assetId)
      .eq("route_id", routeId);

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_ASSET_REMOVED,
      payload: {
        routeId,
        assetId: routeAsset?.asset_id,
        organizationId: route.organization_id,
        routeAssetData: routeAsset,
      },
      correlationId,
    });

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Removed asset ${assetId} from route ${routeId}`
    );

    return new Response(
      JSON.stringify({ success: true, message: "Asset removed from route" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to remove asset from route", { routeId, assetId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to remove asset from route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /routes/:routeId/assignments - Get PM schedule assignments
 */
async function handleGetRouteAssignments(
  routeId: string,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PM schedules assigned to this route
    const { data: pmSchedules, error } = await supabase
      .from("pm_schedules")
      .select(`
        *,
        asset:asset_id (
          id,
          asset_number,
          name
        ),
        job_plan:job_plan_id (
          id,
          job_plan_number,
          title
        ),
        assigned_person:assigned_person_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq("route_id", routeId);

    if (error) throw error;

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Retrieved ${pmSchedules.length} PM assignments for route ${routeId}`
    );

    return new Response(
      JSON.stringify(pmSchedules),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to get route assignments", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to retrieve route assignments", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /routes/:routeId/assignments - Assign PM schedule to route
 */
async function handleAssignPMSchedule(
  routeId: string,
  body: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { schedule_id } = body;

    // Update PM schedule with route_id
    const { data: pmSchedule, error } = await supabase
      .from("pm_schedules")
      .update({ route_id: routeId })
      .eq("id", schedule_id)
      .select()
      .single();

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_PM_ASSIGNED,
      payload: {
        routeId,
        scheduleId: schedule_id,
        organizationId: route.organization_id,
        pmScheduleData: pmSchedule,
      },
      correlationId,
    });

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Assigned PM schedule ${schedule_id} to route ${routeId}`
    );

    return new Response(
      JSON.stringify(pmSchedule),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to assign PM schedule", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to assign PM schedule to route", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /routes/:routeId/assignments/bulk - Bulk assign PM schedules
 */
async function handleBulkAssignPMSchedules(
  routeId: string,
  body: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { schedule_ids } = body;

    // Update all PM schedules with route_id
    const { data: pmSchedules, error } = await supabase
      .from("pm_schedules")
      .update({ route_id: routeId })
      .in("id", schedule_ids)
      .select();

    if (error) throw error;

    // Publish domain events for each assignment
    await Promise.all(
      pmSchedules.map((schedule) =>
        eventBus.publish({
          eventType: DomainEvents.ROUTE_PM_ASSIGNED,
          payload: {
            routeId,
            scheduleId: schedule.id,
            organizationId: route.organization_id,
            pmScheduleData: schedule,
          },
          correlationId,
        })
      )
    );

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Bulk assigned ${pmSchedules.length} PM schedules to route ${routeId}`
    );

    return new Response(
      JSON.stringify({ success: true, assigned: pmSchedules.length, schedules: pmSchedules }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to bulk assign PM schedules", { routeId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to bulk assign PM schedules", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * DELETE /routes/:routeId/assignments/:scheduleId - Unassign PM schedule
 */
async function handleUnassignPMSchedule(
  routeId: string,
  scheduleId: string,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  correlationId: string
) {
  try {
    // Verify route access
    const { data: route, error: routeError } = await supabase
      .from("maintenance_routes")
      .select("organization_id")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasCrossProjectAccess && route.organization_id !== organizationId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clear route_id from PM schedule
    const { data: pmSchedule, error } = await supabase
      .from("pm_schedules")
      .update({ route_id: null })
      .eq("id", scheduleId)
      .eq("route_id", routeId)
      .select()
      .single();

    if (error) throw error;

    // Publish domain event
    await eventBus.publish({
      eventType: DomainEvents.ROUTE_PM_UNASSIGNED,
      payload: {
        routeId,
        scheduleId,
        organizationId: route.organization_id,
        pmScheduleData: pmSchedule,
      },
      correlationId,
    });

    logWithCorrelation(
      correlationId,
      SERVICE_NAME,
      "info",
      `Unassigned PM schedule ${scheduleId} from route ${routeId}`
    );

    return new Response(
      JSON.stringify({ success: true, message: "PM schedule unassigned from route" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const err = error as Error;
    logWithCorrelation(correlationId, SERVICE_NAME, "error", "Failed to unassign PM schedule", { routeId, scheduleId, error: err.message });
    return new Response(
      JSON.stringify({ error: "Failed to unassign PM schedule", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
