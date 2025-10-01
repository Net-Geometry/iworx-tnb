/**
 * Inventory Management Microservice
 * 
 * Handles all inventory-related operations including:
 * - Inventory items CRUD
 * - Location management
 * - Supplier management
 * - Stock transactions
 * - Transfers and loans
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-organization-id, x-cross-project-access',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user context from headers (set by API Gateway)
    const userId = req.headers.get('x-user-id');
    const organizationId = req.headers.get('x-organization-id');
    const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';

    console.log('Inventory Service - Request received:', {
      method: req.method,
      url: req.url,
      userId,
      organizationId,
      hasCrossProjectAccess
    });

    const url = new URL(req.url);
    const path = url.pathname.replace('/inventory-service', '');
    const pathParts = path.split('/').filter(Boolean);

    // Route: GET /items - Get all inventory items
    if (req.method === 'GET' && pathParts[0] === 'items' && pathParts.length === 1) {
      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          suppliers(name),
          inventory_item_locations(
            quantity,
            inventory_locations(name)
          )
        `)
        .eq('is_active', true);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: GET /items/:id - Get single inventory item
    if (req.method === 'GET' && pathParts[0] === 'items' && pathParts.length === 2) {
      const itemId = pathParts[1];

      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          suppliers(name),
          inventory_item_locations(
            quantity,
            inventory_locations(name)
          )
        `)
        .eq('id', itemId)
        .single();

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /items - Create inventory item
    if (req.method === 'POST' && pathParts[0] === 'items') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          ...body,
          reserved_stock: 0,
          organization_id: organizationId,
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // Route: PUT /items/:id - Update inventory item
    if (req.method === 'PUT' && pathParts[0] === 'items' && pathParts.length === 2) {
      const itemId = pathParts[1];
      const body = await req.json();

      const { data, error } = await supabase
        .from('inventory_items')
        .update(body)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: DELETE /items/:id - Delete inventory item
    if (req.method === 'DELETE' && pathParts[0] === 'items' && pathParts.length === 2) {
      const itemId = pathParts[1];

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: GET /locations - Get all inventory locations
    if (req.method === 'GET' && pathParts[0] === 'locations' && pathParts.length === 1) {
      let query = supabase
        .from('inventory_locations')
        .select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: GET /locations/with-items - Get locations with item counts
    if (req.method === 'GET' && pathParts[0] === 'locations' && pathParts[1] === 'with-items') {
      let query = supabase
        .from('inventory_locations')
        .select(`
          *,
          inventory_item_locations(
            id,
            quantity,
            inventory_items(name)
          )
        `);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: locationsData, error: locationsError } = await query.order('name');

      if (locationsError) throw locationsError;

      // Calculate item counts and utilization for each location
      const locationsWithStats = locationsData?.map(location => {
        const itemLocations = location.inventory_item_locations || [];
        const itemCount = itemLocations.length;
        const totalQuantity = itemLocations.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        
        return {
          ...location,
          itemCount,
          totalQuantity,
          utilizationPercentage: location.capacity_limit 
            ? Math.round((location.current_utilization || 0) / location.capacity_limit * 100)
            : 0
        };
      }) || [];

      return new Response(JSON.stringify(locationsWithStats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /locations - Create location
    if (req.method === 'POST' && pathParts[0] === 'locations') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('inventory_locations')
        .insert([{
          ...body,
          organization_id: organizationId,
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // Route: GET /suppliers - Get all suppliers
    if (req.method === 'GET' && pathParts[0] === 'suppliers' && pathParts.length === 1) {
      let query = supabase
        .from('suppliers')
        .select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /suppliers - Create supplier
    if (req.method === 'POST' && pathParts[0] === 'suppliers') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          ...body,
          organization_id: organizationId,
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // Route: GET /stats - Get inventory statistics
    if (req.method === 'GET' && pathParts[0] === 'stats') {
      let itemsQuery = supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true });

      let lowStockQuery = supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true });

      if (!hasCrossProjectAccess && organizationId) {
        itemsQuery = itemsQuery.eq('organization_id', organizationId);
        lowStockQuery = lowStockQuery.eq('organization_id', organizationId);
      }

      const { count: totalItems } = await itemsQuery;
      const { count: lowStockItems } = await lowStockQuery;

      return new Response(JSON.stringify({
        totalItems: totalItems || 0,
        lowStockItems: lowStockItems || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404 - Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Inventory Service Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
