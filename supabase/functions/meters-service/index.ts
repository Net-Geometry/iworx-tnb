import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.replace('/meters-service/', '').replace('/meters-service', '');
    const pathParts = path.split('/').filter(Boolean);

    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
    const userId = req.headers.get('x-user-id');
    const organizationId = req.headers.get('x-organization-id');

    console.log(`[${correlationId}] Meters Service: ${req.method} ${path}`, {
      userId,
      organizationId,
    });

    if (path === 'health' || path === '') {
      return new Response(
        JSON.stringify({ status: 'healthy', service: 'meters-service' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let response;

    // METERS endpoints
    if ((path === 'meters' || path === '' || path === '/') && req.method === 'GET') {
      response = await handleGetMeters(supabase, organizationId);
    } else if (path.match(/^meters\/[^/]+$/) && req.method === 'GET') {
      const meterId = pathParts[1];
      response = await handleGetMeter(supabase, meterId, organizationId);
    } else if (path === 'meters' && req.method === 'POST') {
      const body = await req.json();
      response = await handleCreateMeter(supabase, body, organizationId, userId);
    } else if (path.match(/^meters\/[^/]+$/) && req.method === 'PATCH') {
      const meterId = pathParts[1];
      const body = await req.json();
      response = await handleUpdateMeter(supabase, meterId, body, organizationId);
    } else if (path.match(/^meters\/[^/]+$/) && req.method === 'DELETE') {
      const meterId = pathParts[1];
      response = await handleDeleteMeter(supabase, meterId, organizationId);
    }
    
    // GROUPS endpoints
    else if (path === 'groups' && req.method === 'GET') {
      response = await handleGetGroups(supabase, organizationId);
    } else if (path.match(/^groups\/[^/]+$/) && req.method === 'GET') {
      const groupId = pathParts[1];
      response = await handleGetGroup(supabase, groupId, organizationId);
    } else if (path === 'groups' && req.method === 'POST') {
      const body = await req.json();
      response = await handleCreateGroup(supabase, body, organizationId, userId);
    } else if (path.match(/^groups\/[^/]+$/) && req.method === 'PATCH') {
      const groupId = pathParts[1];
      const body = await req.json();
      response = await handleUpdateGroup(supabase, groupId, body, organizationId);
    } else if (path.match(/^groups\/[^/]+$/) && req.method === 'DELETE') {
      const groupId = pathParts[1];
      response = await handleDeleteGroup(supabase, groupId, organizationId);
    }
    
    // ASSIGNMENTS endpoints
    else if (path.match(/^groups\/[^/]+\/assignments$/) && req.method === 'GET') {
      const groupId = pathParts[1];
      response = await handleGetAssignments(supabase, groupId, organizationId);
    } else if (path.match(/^groups\/[^/]+\/assignments$/) && req.method === 'POST') {
      const groupId = pathParts[1];
      const body = await req.json();
      response = await handleCreateAssignment(supabase, groupId, body, organizationId, userId);
    } else if (path.match(/^assignments\/[^/]+$/) && req.method === 'DELETE') {
      const assignmentId = pathParts[1];
      response = await handleDeleteAssignment(supabase, assignmentId, organizationId);
    }
    
    else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in meters-service:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============ METERS HANDLERS ============

async function handleGetMeters(supabase: any, organizationId: string | null) {
  let query = supabase
    .from('meters')
    .select('*, unit:unit_id(id, name, abbreviation)');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return { meters: data || [] };
}

async function handleGetMeter(supabase: any, meterId: string, organizationId: string | null) {
  let query = supabase
    .from('meters')
    .select('*, unit:unit_id(id, name, abbreviation)')
    .eq('id', meterId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.single();

  if (error) throw error;
  return { meter: data };
}

async function handleCreateMeter(supabase: any, body: any, organizationId: string | null, userId: string | null) {
  const { data, error } = await supabase
    .from('meters')
    .insert([{
      ...body,
      organization_id: organizationId,
      created_by: userId,
    }])
    .select('*, unit:unit_id(id, name, abbreviation)')
    .single();

  if (error) throw error;
  return { meter: data };
}

async function handleUpdateMeter(supabase: any, meterId: string, body: any, organizationId: string | null) {
  const { unit, location, ...cleanData } = body;

  let query = supabase
    .from('meters')
    .update({
      ...cleanData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', meterId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query
    .select('*, unit:unit_id(id, name, abbreviation)')
    .single();

  if (error) throw error;
  return { meter: data };
}

async function handleDeleteMeter(supabase: any, meterId: string, organizationId: string | null) {
  let query = supabase
    .from('meters')
    .delete()
    .eq('id', meterId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { error } = await query;

  if (error) throw error;
  return { success: true };
}

// ============ GROUPS HANDLERS ============

async function handleGetGroups(supabase: any, organizationId: string | null) {
  let query = supabase
    .from('meter_groups')
    .select('*');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return { groups: data || [] };
}

async function handleGetGroup(supabase: any, groupId: string, organizationId: string | null) {
  let query = supabase
    .from('meter_groups')
    .select('*')
    .eq('id', groupId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.single();

  if (error) throw error;
  return { group: data };
}

async function handleCreateGroup(supabase: any, body: any, organizationId: string | null, userId: string | null) {
  const { data, error } = await supabase
    .from('meter_groups')
    .insert([{
      ...body,
      organization_id: organizationId,
      created_by: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return { group: data };
}

async function handleUpdateGroup(supabase: any, groupId: string, body: any, organizationId: string | null) {
  let query = supabase
    .from('meter_groups')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.select().single();

  if (error) throw error;
  return { group: data };
}

async function handleDeleteGroup(supabase: any, groupId: string, organizationId: string | null) {
  let query = supabase
    .from('meter_groups')
    .delete()
    .eq('id', groupId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { error } = await query;

  if (error) throw error;
  return { success: true };
}

// ============ ASSIGNMENTS HANDLERS ============

async function handleGetAssignments(supabase: any, groupId: string, organizationId: string | null) {
  let query = supabase
    .from('meter_group_assignments')
    .select('*')
    .eq('meter_group_id', groupId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('assigned_date', { ascending: false });

  if (error) throw error;
  return { assignments: data || [] };
}

async function handleCreateAssignment(supabase: any, groupId: string, body: any, organizationId: string | null, userId: string | null) {
  const { data, error } = await supabase
    .from('meter_group_assignments')
    .insert([{
      ...body,
      meter_group_id: groupId,
      organization_id: organizationId,
      assigned_by: userId,
    }])
    .select()
    .single();

  if (error) throw error;
  return { assignment: data };
}

async function handleDeleteAssignment(supabase: any, assignmentId: string, organizationId: string | null) {
  let query = supabase
    .from('meter_group_assignments')
    .delete()
    .eq('id', assignmentId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { error } = await query;

  if (error) throw error;
  return { success: true };
}
