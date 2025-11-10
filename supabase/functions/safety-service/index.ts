import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-organization-id, x-cross-project-access',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract auth info from headers (set by API Gateway)
    const userId = req.headers.get('x-user-id');
    const organizationId = req.headers.get('x-organization-id');
    const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';

    console.log('Safety Service - Request:', {
      method: req.method,
      url: req.url,
      userId,
      organizationId,
      hasCrossProjectAccess
    });

    const url = new URL(req.url);
    
    // Strip the function name prefix if present 
    // (e.g., /safety-service/incidents -> /incidents)
    let path = url.pathname;
    if (path.startsWith('/safety-service')) {
      path = path.replace('/safety-service', '');
    }
    
    const pathParts = path.split('/').filter(Boolean);
    
    // Route: /safety/health
    if (pathParts[0] === 'health') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy', 
          service: 'safety-service',
          timestamp: new Date().toISOString() 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: /safety/incidents/*
    if (pathParts[0] === 'incidents') {
      return await handleIncidents(req, supabase, pathParts, organizationId, hasCrossProjectAccess, userId);
    }

    // Route: /safety/precautions/*
    if (pathParts[0] === 'precautions') {
      return await handlePrecautions(req, supabase, pathParts, organizationId, hasCrossProjectAccess, userId);
    }

    // Route: /safety/capa/*
    if (pathParts[0] === 'capa') {
      return await handleCAPA(req, supabase, pathParts, organizationId, hasCrossProjectAccess, userId);
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Safety Service Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Incidents Handler
async function handleIncidents(
  req: Request,
  supabase: any,
  pathParts: string[],
  organizationId: string | null,
  hasCrossProjectAccess: boolean,
  userId: string | null
) {
  const method = req.method;

  // GET /incidents - List all incidents
  if (method === 'GET' && pathParts.length === 1) {
    let query = supabase
      .from('safety_incidents')
      .select('*')
      .order('incident_date', { ascending: false });

    // Apply organization filter
    if (!hasCrossProjectAccess && organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // GET /incidents/:id - Get single incident
  if (method === 'GET' && pathParts.length === 2) {
    const incidentId = pathParts[1];
    
    let query = supabase
      .from('safety_incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    const { data, error } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // POST /incidents - Create new incident
  if (method === 'POST' && pathParts.length === 1) {
    const body = await req.json();
    
    // Log incident creation details
    console.log('📝 Creating incident:', {
      incident_number: body.incident_number,
      title: body.title,
      asset_id: body.asset_id,
      asset_id_type: typeof body.asset_id,
      location: body.location,
      timestamp: new Date().toISOString()
    });

    // Validate asset_id if provided
    if (body.asset_id && body.asset_id !== null && body.asset_id !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.asset_id)) {
        console.error('❌ Invalid asset_id UUID format:', body.asset_id);
        throw new Error(`Invalid asset_id UUID format: ${body.asset_id}`);
      }
      console.log('✅ Valid asset_id:', body.asset_id);
    } else {
      console.log('ℹ️ No asset assigned to this incident');
    }
    
    const { data, error } = await supabase
      .from('safety_incidents')
      .insert({
        ...body,
        organization_id: organizationId,
        reported_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Incident created successfully:', data.id);

    return new Response(
      JSON.stringify(data),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // PATCH /incidents/:id - Update incident
  if (method === 'PATCH' && pathParts.length === 2) {
    const incidentId = pathParts[1];
    const body = await req.json();
    
    // Log incident update details including engineering assessment
    console.log('📝 Updating incident:', {
      incident_id: incidentId,
      asset_id: body.asset_id,
      asset_id_type: typeof body.asset_id,
      has_engineering_assessment: !!(body.suggested_job_plan_id || body.immediate_actions),
      suggested_job_plan_id: body.suggested_job_plan_id,
      timestamp: new Date().toISOString()
    });

    // Validate asset_id if provided
    if (body.asset_id && body.asset_id !== null && body.asset_id !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.asset_id)) {
        console.error('❌ Invalid asset_id UUID format:', body.asset_id);
        throw new Error(`Invalid asset_id UUID format: ${body.asset_id}`);
      }
      console.log('✅ Valid asset_id:', body.asset_id);
    } else if (body.hasOwnProperty('asset_id')) {
      console.log('ℹ️ Clearing asset assignment');
    }
    
    // Validate suggested_job_plan_id if provided
    if (body.suggested_job_plan_id && body.suggested_job_plan_id !== null && body.suggested_job_plan_id !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.suggested_job_plan_id)) {
        console.error('❌ Invalid suggested_job_plan_id UUID format:', body.suggested_job_plan_id);
        throw new Error(`Invalid suggested_job_plan_id UUID format: ${body.suggested_job_plan_id}`);
      }
      console.log('✅ Valid suggested_job_plan_id:', body.suggested_job_plan_id);
    } else if (body.hasOwnProperty('suggested_job_plan_id')) {
      console.log('ℹ️ Clearing job plan suggestion');
    }
    
    // Validate priority_assessment if provided
    if (body.priority_assessment) {
      const validPriorities = ['can_wait', 'should_schedule', 'urgent', 'critical'];
      if (!validPriorities.includes(body.priority_assessment)) {
        console.error('❌ Invalid priority_assessment:', body.priority_assessment);
        throw new Error(`Invalid priority_assessment. Must be one of: ${validPriorities.join(', ')}`);
      }
      console.log('✅ Valid priority_assessment:', body.priority_assessment);
    }
    
    const { data, error } = await supabase
      .from('safety_incidents')
      .update(body)
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Incident updated successfully:', incidentId);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // DELETE /incidents/:id - Delete incident
  if (method === 'DELETE' && pathParts.length === 2) {
    const incidentId = pathParts[1];
    
    const { error } = await supabase
      .from('safety_incidents')
      .delete()
      .eq('id', incidentId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Precautions Handler
async function handlePrecautions(
  req: Request,
  supabase: any,
  pathParts: string[],
  organizationId: string | null,
  hasCrossProjectAccess: boolean,
  userId: string | null
) {
  const method = req.method;
  const url = new URL(req.url);

  // GET /precautions - List all precautions with optional filters
  if (method === 'GET' && pathParts.length === 1) {
    let query = supabase
      .from('safety_precautions')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply organization filter
    if (!hasCrossProjectAccess && organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    // Apply search filter
    const search = url.searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,precaution_code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter
    const category = url.searchParams.get('category');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply severity filter
    const severity = url.searchParams.get('severity');
    if (severity && severity !== 'all') {
      query = query.eq('severity_level', severity);
    }

    // Apply status filter
    const status = url.searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // GET /precautions/:id - Get single precaution
  if (method === 'GET' && pathParts.length === 2) {
    const precautionId = pathParts[1];
    
    const { data, error } = await supabase
      .from('safety_precautions')
      .select('*')
      .eq('id', precautionId)
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // POST /precautions - Create new precaution
  if (method === 'POST' && pathParts.length === 1) {
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('safety_precautions')
      .insert({
        ...body,
        organization_id: organizationId,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // PATCH /precautions/:id - Update precaution
  if (method === 'PATCH' && pathParts.length === 2) {
    const precautionId = pathParts[1];
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('safety_precautions')
      .update(body)
      .eq('id', precautionId)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // POST /precautions/:id/increment-usage - Increment usage count
  if (method === 'POST' && pathParts.length === 3 && pathParts[2] === 'increment-usage') {
    const precautionId = pathParts[1];
    
    const { data, error } = await supabase.rpc('increment_precaution_usage', {
      precaution_id: precautionId
    });

    if (error) {
      // Fallback if function doesn't exist
      const { data: current, error: fetchError } = await supabase
        .from('safety_precautions')
        .select('usage_count')
        .eq('id', precautionId)
        .single();

      if (fetchError) throw fetchError;

      const { data: updated, error: updateError } = await supabase
        .from('safety_precautions')
        .update({ usage_count: (current.usage_count || 0) + 1 })
        .eq('id', precautionId)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify(updated),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // DELETE /precautions/:id - Delete precaution
  if (method === 'DELETE' && pathParts.length === 2) {
    const precautionId = pathParts[1];
    
    const { error } = await supabase
      .from('safety_precautions')
      .delete()
      .eq('id', precautionId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// CAPA Handler
async function handleCAPA(
  req: Request,
  supabase: any,
  pathParts: string[],
  organizationId: string | null,
  hasCrossProjectAccess: boolean,
  userId: string | null
) {
  const method = req.method;

  // GET /capa - List all CAPA records
  if (method === 'GET' && pathParts.length === 1) {
    let query = supabase
      .from('capa_records')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply organization filter
    if (!hasCrossProjectAccess && organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // GET /capa/:id - Get single CAPA record
  if (method === 'GET' && pathParts.length === 2) {
    const capaId = pathParts[1];
    
    const { data, error } = await supabase
      .from('capa_records')
      .select('*')
      .eq('id', capaId)
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // POST /capa - Create new CAPA record
  if (method === 'POST' && pathParts.length === 1) {
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('capa_records')
      .insert({
        ...body,
        organization_id: organizationId,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // PATCH /capa/:id - Update CAPA record
  if (method === 'PATCH' && pathParts.length === 2) {
    const capaId = pathParts[1];
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('capa_records')
      .update({
        ...body,
        updated_by: userId
      })
      .eq('id', capaId)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // DELETE /capa/:id - Delete CAPA record
  if (method === 'DELETE' && pathParts.length === 2) {
    const capaId = pathParts[1];
    
    const { error } = await supabase
      .from('capa_records')
      .delete()
      .eq('id', capaId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
