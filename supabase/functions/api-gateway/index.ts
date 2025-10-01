/**
 * API Gateway - Central routing for microservices
 * 
 * Routes requests to appropriate microservices and handles:
 * - Authentication and authorization
 * - CORS configuration
 * - Request/response transformation
 * - Service discovery and health checks
 * - Error handling and logging
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Service registry for microservice endpoints
const SERVICE_REGISTRY = {
  assets: {
    url: `${SUPABASE_URL}/functions/v1/asset-service`,
    healthEndpoint: "/health",
  },
  "work-orders": {
    url: `${SUPABASE_URL}/functions/v1/work-order-service`,
    healthEndpoint: "/health",
  },
  inventory: {
    url: `${SUPABASE_URL}/functions/v1/inventory-service`,
    healthEndpoint: "/health",
  },
  people: {
    url: `${SUPABASE_URL}/functions/v1/people-service`,
    healthEndpoint: "/health",
  },
  safety: {
    url: `${SUPABASE_URL}/functions/v1/safety-service`,
    healthEndpoint: "/health",
  },
};

/**
 * Route request to appropriate microservice
 */
async function routeRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  console.log(`[API Gateway] Routing request: ${req.method} ${path}`);

  // Extract service name from path (e.g., /api/assets/* -> assets)
  const pathParts = path.split("/").filter(Boolean);
  
  if (pathParts[0] !== "api") {
    return new Response(
      JSON.stringify({ error: "Invalid API path. Use /api/{service}/{endpoint}" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const serviceName = pathParts[1]; // e.g., "assets"
  const service = SERVICE_REGISTRY[serviceName as keyof typeof SERVICE_REGISTRY];

  if (!service) {
    return new Response(
      JSON.stringify({ 
        error: `Service '${serviceName}' not found`,
        availableServices: Object.keys(SERVICE_REGISTRY)
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Forward request to microservice
  const serviceUrl = `${service.url}${path.replace(`/api/${serviceName}`, "")}${url.search}`;
  
  try {
    const serviceResponse = await fetch(serviceUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    });

    // Clone response with CORS headers
    const responseBody = await serviceResponse.text();
    return new Response(responseBody, {
      status: serviceResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": serviceResponse.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[API Gateway] Error routing to ${serviceName}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: "Service unavailable",
        service: serviceName,
        message: errorMessage 
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Health check endpoint
 */
async function healthCheck(): Promise<Response> {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>,
  };

  // Check health of all registered services
  for (const [name, service] of Object.entries(SERVICE_REGISTRY)) {
    try {
      const healthUrl = `${service.url}${service.healthEndpoint || "/health"}`;
      const response = await fetch(healthUrl, { method: "GET" });
      health.services[name] = response.ok ? "healthy" : "unhealthy";
    } catch (error) {
      health.services[name] = "unavailable";
    }
  }

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Verify JWT token and extract user information
 */
async function verifyAuth(authHeader: string | null): Promise<{ userId: string; organizationId: string; hasCrossProjectAccess: boolean } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("[API Gateway] Auth error:", error);
      return null;
    }

    // Get user's organization
    const { data: orgData } = await supabase
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    // Check if user has cross-project access
    const { data: hasCrossAccess } = await supabase
      .rpc("has_cross_project_access", { _user_id: user.id });

    return {
      userId: user.id,
      organizationId: orgData?.organization_id || "",
      hasCrossProjectAccess: hasCrossAccess || false,
    };
  } catch (error) {
    console.error("[API Gateway] Auth verification failed:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Health check endpoint
    if (path === "/health" || path === "/api/health") {
      return await healthCheck();
    }

    // Verify authentication for protected routes
    const authHeader = req.headers.get("authorization");
    const authInfo = await verifyAuth(authHeader);

    if (!authInfo && !path.includes("/public")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add auth info to request headers for downstream services
    const modifiedHeaders = new Headers(req.headers);
    if (authInfo) {
      modifiedHeaders.set("x-user-id", authInfo.userId);
      modifiedHeaders.set("x-organization-id", authInfo.organizationId);
      modifiedHeaders.set("x-cross-project-access", authInfo.hasCrossProjectAccess.toString());
    }

    // Create modified request with auth headers
    const modifiedReq = new Request(req.url, {
      method: req.method,
      headers: modifiedHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // Route to appropriate service
    return await routeRequest(modifiedReq);

  } catch (error) {
    console.error("[API Gateway] Unhandled error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
