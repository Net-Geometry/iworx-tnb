/**
 * Asset Management Microservice
 * 
 * Handles all asset-related operations including:
 * - CRUD operations for assets
 * - Asset hierarchy management
 * - Asset document management
 * - Asset health scoring and criticality
 * - Asset lifecycle management
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id, x-organization-id",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

/**
 * Get all assets with filters
 */
async function getAssets(
  supabase: any,
  organizationId: string,
  hasCrossProjectAccess: boolean,
  searchParams: URLSearchParams
) {
  console.log("[Asset Service] Fetching assets");

  let query = supabase
    .from("assets_service.assets")
    .select("*");

  // Apply organization filter unless user has cross-project access
  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  // Apply filters from query parameters
  const status = searchParams.get("status");
  const criticality = searchParams.get("criticality");
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  if (status) query = query.eq("status", status);
  if (criticality) query = query.eq("criticality", criticality);
  if (type) query = query.eq("type", type);
  if (search) {
    query = query.or(`name.ilike.%${search}%,asset_number.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  // Transform data and fetch hierarchy info separately if needed
  const transformedAssets = await Promise.all((data || []).map(async (asset: any) => {
    const parsed = parseJsonFields(asset);
    
    // Fetch hierarchy node if exists
    let hierarchyName = "Unassigned";
    let hierarchyPath = "Unassigned";
    
    if (asset.hierarchy_node_id) {
      const { data: hierarchyNode } = await supabase
        .from("assets_service.hierarchy_nodes")
        .select("id, name, path")
        .eq("id", asset.hierarchy_node_id)
        .single();
      
      if (hierarchyNode) {
        hierarchyName = hierarchyNode.name || "Unassigned";
        hierarchyPath = hierarchyNode.path || hierarchyNode.name || "Unassigned";
      }
    }
    
    return {
      ...parsed,
      location: hierarchyName,
      hierarchy_path: hierarchyPath,
      model_3d_url: parsed.model_3d_url,
      model_3d_scale: parsed.model_3d_scale || { x: 1, y: 1, z: 1 },
      model_3d_rotation: parsed.model_3d_rotation || { x: 0, y: 0, z: 0 },
    };
  }));

  return transformedAssets;
}

/**
 * Get single asset by ID
 */
async function getAssetById(supabase: any, id: string, organizationId: string, hasCrossProjectAccess: boolean) {
  console.log(`[Asset Service] Fetching asset ${id}`);

  let query = supabase
    .from("assets_service.assets")
    .select("*")
    .eq("id", id);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.single();

  if (error) throw error;

  const parsed = parseJsonFields(data);
  
  // Fetch hierarchy node if exists
  let hierarchyName = "Unassigned";
  let hierarchyPath = "Unassigned";
  
  if (data.hierarchy_node_id) {
    const { data: hierarchyNode } = await supabase
      .from("assets_service.hierarchy_nodes")
      .select("id, name, path")
      .eq("id", data.hierarchy_node_id)
      .single();
    
    if (hierarchyNode) {
      hierarchyName = hierarchyNode.name || "Unassigned";
      hierarchyPath = hierarchyNode.path || hierarchyNode.name || "Unassigned";
    }
  }
  
  return {
    ...parsed,
    location: hierarchyName,
    hierarchy_path: hierarchyPath,
    model_3d_url: parsed.model_3d_url,
    model_3d_scale: parsed.model_3d_scale || { x: 1, y: 1, z: 1 },
    model_3d_rotation: parsed.model_3d_rotation || { x: 0, y: 0, z: 0 },
  };
}

/**
 * Helper to parse JSON fields from JSONB columns
 */
function parseJsonFields(data: any) {
  const parsed = { ...data };
  
  // Parse model_3d_scale if it's a string
  if (typeof parsed.model_3d_scale === 'string') {
    try {
      parsed.model_3d_scale = JSON.parse(parsed.model_3d_scale);
    } catch (e) {
      console.error('[Asset Service] Failed to parse model_3d_scale:', e);
      parsed.model_3d_scale = { x: 1, y: 1, z: 1 };
    }
  }
  
  // Parse model_3d_rotation if it's a string
  if (typeof parsed.model_3d_rotation === 'string') {
    try {
      parsed.model_3d_rotation = JSON.parse(parsed.model_3d_rotation);
    } catch (e) {
      console.error('[Asset Service] Failed to parse model_3d_rotation:', e);
      parsed.model_3d_rotation = { x: 0, y: 0, z: 0 };
    }
  }
  
  return parsed;
}

/**
 * Helper to process JSON fields for JSONB columns
 */
function processJsonFields(data: any) {
  const processed = { ...data };
  
  // Convert JSON objects to strings for JSONB columns
  if (processed.model_3d_scale && typeof processed.model_3d_scale === 'object') {
    processed.model_3d_scale = JSON.stringify(processed.model_3d_scale);
  }
  
  if (processed.model_3d_rotation && typeof processed.model_3d_rotation === 'object') {
    processed.model_3d_rotation = JSON.stringify(processed.model_3d_rotation);
  }
  
  return processed;
}

/**
 * Create new asset
 */
async function createAsset(supabase: any, assetData: any, organizationId: string) {
  console.log("[Asset Service] Creating asset");

  const processedData = processJsonFields(assetData);
  const dataWithOrg = {
    ...processedData,
    organization_id: organizationId,
  };

  const { data, error } = await supabase
    .from("assets_service.assets")
    .insert([dataWithOrg])
    .select()
    .single();

  if (error) throw error;

  // Generate public URL for QR code if not already set or if it's pending
  if (data.id && (!data.qr_code_data || data.qr_code_data.startsWith('pending-creation'))) {
    const publicUrl = `https://jsqzkaarpfowgmijcwaw.supabase.co/public/asset/${data.id}`;
    
    // Update the asset with the public QR code URL
    const { error: updateError } = await supabase
      .from("assets_service.assets")
      .update({ qr_code_data: publicUrl })
      .eq("id", data.id);
    
    if (updateError) {
      console.error('[Asset Service] Failed to update QR code URL:', updateError);
    } else {
      data.qr_code_data = publicUrl;
      console.log('[Asset Service] Generated public QR code URL:', publicUrl);
    }
  }

  return data;
}

/**
 * Update existing asset
 */
async function updateAsset(supabase: any, id: string, assetData: any, organizationId: string, hasCrossProjectAccess: boolean) {
  console.log(`[Asset Service] Updating asset ${id}`);

  const processedData = processJsonFields(assetData);

  // Ensure QR code data uses public URL format if being updated
  if (processedData.qr_code_data && !processedData.qr_code_data.startsWith('http')) {
    processedData.qr_code_data = `https://jsqzkaarpfowgmijcwaw.supabase.co/public/asset/${id}`;
    console.log('[Asset Service] Updated QR code to use public URL format');
  }

  let query = supabase
    .from("assets_service.assets")
    .update(processedData)
    .eq("id", id);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.select().single();

  if (error) throw error;

  return data;
}

/**
 * Delete asset
 */
async function deleteAsset(supabase: any, id: string, organizationId: string, hasCrossProjectAccess: boolean) {
  console.log(`[Asset Service] Deleting asset ${id}`);

  let query = supabase
    .from("assets_service.assets")
    .delete()
    .eq("id", id);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { error } = await query;

  if (error) throw error;

  return { success: true };
}

/**
 * Get asset hierarchy
 */
async function getAssetHierarchy(supabase: any, assetId: string) {
  console.log(`[Asset Service] Fetching hierarchy for asset ${assetId}`);

  const { data: asset, error } = await supabase
    .from("assets_service.assets")
    .select("*")
    .eq("id", assetId)
    .single();

  if (error) throw error;
  
  // Fetch hierarchy info separately
  let hierarchyNode = null;
  if (asset.hierarchy_node_id) {
    const { data } = await supabase
      .from("assets_service.hierarchy_nodes")
      .select("id, name, path, parent_id, hierarchy_level_id")
      .eq("id", asset.hierarchy_node_id)
      .single();
    hierarchyNode = data;
  }

  return {
    asset,
    hierarchy: hierarchyNode,
  };
}

/**
 * Health check endpoint
 */
function healthCheck() {
  return {
    status: "healthy",
    service: "asset-service",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if user has cross-project access
 */
async function checkCrossProjectAccess(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("has_cross_project_access", {
    _user_id: userId,
  });
  return data || false;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const searchParams = url.searchParams;

  try {
    // Health check
    if (path === "/health") {
      return new Response(JSON.stringify(healthCheck()), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get auth info from headers (set by API Gateway)
    const userId = req.headers.get("x-user-id");
    const organizationId = req.headers.get("x-organization-id");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check cross-project access
    const hasCrossProjectAccess = await checkCrossProjectAccess(supabase, userId);

    /**
     * Path parsing: API Gateway forwards /api/assets to /asset-service/
     * Filter out 'asset-service' from pathParts to get the actual route segments
     */
    const pathParts = path.split("/").filter(p => p && p !== 'asset-service');
    const assetId = pathParts.length > 0 ? pathParts[0] : null;

    // GET /assets - List all assets
    if (req.method === "GET" && !assetId) {
      const assets = await getAssets(supabase, organizationId || "", hasCrossProjectAccess, searchParams);
      return new Response(JSON.stringify(assets), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /assets/:id - Get single asset
    if (req.method === "GET" && assetId && !pathParts[1]) {
      const asset = await getAssetById(supabase, assetId, organizationId || "", hasCrossProjectAccess);
      return new Response(JSON.stringify(asset), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /assets/:id/hierarchy - Get asset hierarchy
    if (req.method === "GET" && assetId && pathParts[1] === "hierarchy") {
      const hierarchy = await getAssetHierarchy(supabase, assetId);
      return new Response(JSON.stringify(hierarchy), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /assets - Create new asset
    if (req.method === "POST" && !assetId) {
      const body = await req.json();
      const asset = await createAsset(supabase, body, organizationId || "");
      return new Response(JSON.stringify(asset), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT/PATCH /assets/:id - Update asset
    if ((req.method === "PUT" || req.method === "PATCH") && assetId) {
      const body = await req.json();
      const asset = await updateAsset(supabase, assetId, body, organizationId || "", hasCrossProjectAccess);
      return new Response(JSON.stringify(asset), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /assets/:id - Delete asset
    if (req.method === "DELETE" && assetId) {
      const result = await deleteAsset(supabase, assetId, organizationId || "", hasCrossProjectAccess);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Not found
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Asset Service] Error:", error);
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
