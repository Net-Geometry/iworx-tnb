import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { createEventBus, DomainEvents } from "../_shared/event-bus.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-organization-id, x-cross-project-access, x-correlation-id',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const eventBus = createEventBus('job-plans-service');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Job Plans Service] Request received:', req.method, req.url);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract auth and context from API Gateway headers
    const userId = req.headers.get('x-user-id');
    const organizationId = req.headers.get('x-organization-id');
    const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

    console.log('[Job Plans Service] Context:', { userId, organizationId, hasCrossProjectAccess, correlationId });

    const url = new URL(req.url);
    let path = url.pathname.replace('/job-plans-service', '');
    const pathParts = path.split('/').filter(Boolean);

    // Health check
    if (pathParts[0] === 'health') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy', 
          service: 'job-plans-service',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Job Plans routes
    if (pathParts[0] === 'job-plans') {
      if (pathParts.length === 1) {
        // GET /job-plans - List all or POST /job-plans - Create
        if (req.method === 'GET') {
          return await listJobPlans(supabase, organizationId, hasCrossProjectAccess);
        } else if (req.method === 'POST') {
          const body = await req.json();
          return await createJobPlan(supabase, body, organizationId, userId, correlationId);
        }
      } else if (pathParts[1] === 'stats') {
        // GET /job-plans/stats
        return await getJobPlanStats(supabase, organizationId, hasCrossProjectAccess);
      } else if (pathParts.length === 2) {
        // GET, PATCH, DELETE /job-plans/:id
        const jobPlanId = pathParts[1];
        if (req.method === 'GET') {
          return await getJobPlan(supabase, jobPlanId, organizationId, hasCrossProjectAccess);
        } else if (req.method === 'PATCH') {
          const body = await req.json();
          return await updateJobPlan(supabase, jobPlanId, body, organizationId, hasCrossProjectAccess, correlationId);
        } else if (req.method === 'DELETE') {
          return await deleteJobPlan(supabase, jobPlanId, organizationId, hasCrossProjectAccess, correlationId);
        }
      }
    }

    // Task routes
    if (pathParts[0] === 'tasks') {
      if (req.method === 'POST') {
        const body = await req.json();
        return await createTask(supabase, body, organizationId, correlationId);
      } else if (pathParts.length === 2) {
        const taskId = pathParts[1];
        if (req.method === 'PATCH') {
          const body = await req.json();
          return await updateTask(supabase, taskId, body, correlationId);
        } else if (req.method === 'DELETE') {
          return await deleteTask(supabase, taskId, correlationId);
        }
      }
    }

    // Parts routes
    if (pathParts[0] === 'parts') {
      if (req.method === 'POST') {
        const body = await req.json();
        return await createPart(supabase, body, organizationId, correlationId);
      } else if (pathParts.length === 2) {
        const partId = pathParts[1];
        if (req.method === 'PATCH') {
          const body = await req.json();
          return await updatePart(supabase, partId, body, correlationId);
        } else if (req.method === 'DELETE') {
          return await deletePart(supabase, partId, correlationId);
        }
      }
    }

    // Tools routes
    if (pathParts[0] === 'tools') {
      if (req.method === 'POST') {
        const body = await req.json();
        return await createTool(supabase, body, organizationId, correlationId);
      } else if (pathParts.length === 2) {
        const toolId = pathParts[1];
        if (req.method === 'PATCH') {
          const body = await req.json();
          return await updateTool(supabase, toolId, body, correlationId);
        } else if (req.method === 'DELETE') {
          return await deleteTool(supabase, toolId, correlationId);
        }
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Job Plans Service] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// Job Plans CRUD Operations
// ============================================================================

async function listJobPlans(supabase: any, organizationId: string | null, hasCrossProjectAccess: boolean) {
  console.log('[Job Plans Service] Listing job plans');
  
  let query = supabase.from('job_plans').select(`
    *,
    tasks:job_plan_tasks(*),
    parts:job_plan_parts(*),
    tools:job_plan_tools(*),
    documents:job_plan_documents(*)
  `);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[Job Plans Service] Error listing job plans:', error);
    throw error;
  }

  console.log('[Job Plans Service] Found', data?.length || 0, 'job plans');
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getJobPlan(supabase: any, id: string, organizationId: string | null, hasCrossProjectAccess: boolean) {
  console.log('[Job Plans Service] Getting job plan:', id);
  
  let query = supabase.from('job_plans').select(`
    *,
    tasks:job_plan_tasks(*),
    parts:job_plan_parts(*),
    tools:job_plan_tools(*),
    documents:job_plan_documents(*)
  `).eq('id', id);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[Job Plans Service] Error getting job plan:', error);
    throw error;
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Job plan not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[Job Plans Service] Job plan found');
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createJobPlan(supabase: any, body: any, organizationId: string | null, userId: string | null, correlationId: string) {
  console.log('[Job Plans Service] Creating job plan');
  
  const { tasks, parts, tools, documents, ...jobPlanData } = body;

  // Insert job plan
  const { data: jobPlan, error: jobPlanError } = await supabase
    .from('job_plans')
    .insert([{ ...jobPlanData, organization_id: organizationId }])
    .select()
    .single();

  if (jobPlanError) {
    console.error('[Job Plans Service] Error creating job plan:', jobPlanError);
    throw jobPlanError;
  }

  console.log('[Job Plans Service] Job plan created:', jobPlan.id);

  // Insert related data
  if (tasks && tasks.length > 0) {
    const tasksToInsert = tasks.map((task: any) => ({
      ...task,
      job_plan_id: jobPlan.id,
      organization_id: organizationId
    }));
    await supabase.from('job_plan_tasks').insert(tasksToInsert);
  }

  if (parts && parts.length > 0) {
    const partsToInsert = parts.map((part: any) => ({
      ...part,
      job_plan_id: jobPlan.id,
      organization_id: organizationId
    }));
    await supabase.from('job_plan_parts').insert(partsToInsert);
  }

  if (tools && tools.length > 0) {
    const toolsToInsert = tools.map((tool: any) => ({
      ...tool,
      job_plan_id: jobPlan.id,
      organization_id: organizationId
    }));
    await supabase.from('job_plan_tools').insert(toolsToInsert);
  }

  // Publish event
  await eventBus.publish({
    eventType: DomainEvents.JOB_PLAN_CREATED,
    correlationId,
    payload: {
      jobPlanId: jobPlan.id,
      jobPlanNumber: jobPlan.job_plan_number,
      title: jobPlan.title,
      organizationId,
      createdBy: userId,
    },
  });

  console.log('[Job Plans Service] Job plan creation complete');
  
  return new Response(
    JSON.stringify(jobPlan),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateJobPlan(supabase: any, id: string, body: any, organizationId: string | null, hasCrossProjectAccess: boolean, correlationId: string) {
  console.log('[Job Plans Service] Updating job plan:', id);
  
  let query = supabase
    .from('job_plans')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.select().maybeSingle();

  if (error) {
    console.error('[Job Plans Service] Error updating job plan:', error);
    throw error;
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Job plan not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Publish event
  await eventBus.publish({
    eventType: DomainEvents.JOB_PLAN_UPDATED,
    correlationId,
    payload: {
      jobPlanId: id,
      changes: body,
      organizationId,
    },
  });

  console.log('[Job Plans Service] Job plan updated');
  
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteJobPlan(supabase: any, id: string, organizationId: string | null, hasCrossProjectAccess: boolean, correlationId: string) {
  console.log('[Job Plans Service] Deleting job plan:', id);
  
  let query = supabase
    .from('job_plans')
    .delete()
    .eq('id', id);

  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { error } = await query;

  if (error) {
    console.error('[Job Plans Service] Error deleting job plan:', error);
    throw error;
  }

  // Publish event
  await eventBus.publish({
    eventType: DomainEvents.JOB_PLAN_DELETED,
    correlationId,
    payload: {
      jobPlanId: id,
      organizationId,
    },
  });

  console.log('[Job Plans Service] Job plan deleted');
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getJobPlanStats(supabase: any, organizationId: string | null, hasCrossProjectAccess: boolean) {
  console.log('[Job Plans Service] Getting job plan stats');
  
  let query = supabase.from('job_plans').select('*');
  
  if (!hasCrossProjectAccess && organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Job Plans Service] Error getting stats:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    by_status: {} as Record<string, number>,
    by_type: {} as Record<string, number>,
  };

  data.forEach((jp: any) => {
    stats.by_status[jp.status] = (stats.by_status[jp.status] || 0) + 1;
    stats.by_type[jp.job_type] = (stats.by_type[jp.job_type] || 0) + 1;
  });

  console.log('[Job Plans Service] Stats calculated');
  
  return new Response(
    JSON.stringify(stats),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// Task Operations
// ============================================================================

async function createTask(supabase: any, body: any, organizationId: string | null, correlationId: string) {
  console.log('[Job Plans Service] Creating task');
  
  const { data, error } = await supabase
    .from('job_plan_tasks')
    .insert([{ ...body, organization_id: organizationId }])
    .select()
    .single();

  if (error) throw error;

  console.log('[Job Plans Service] Task created:', data.id);
  
  return new Response(
    JSON.stringify(data),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateTask(supabase: any, id: string, body: any, correlationId: string) {
  console.log('[Job Plans Service] Updating task:', id);
  
  const { data, error } = await supabase
    .from('job_plan_tasks')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Task not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[Job Plans Service] Task updated');
  
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteTask(supabase: any, id: string, correlationId: string) {
  console.log('[Job Plans Service] Deleting task:', id);
  
  const { error } = await supabase
    .from('job_plan_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;

  console.log('[Job Plans Service] Task deleted');
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// Part Operations
// ============================================================================

async function createPart(supabase: any, body: any, organizationId: string | null, correlationId: string) {
  console.log('[Job Plans Service] Creating part');
  
  const { data, error } = await supabase
    .from('job_plan_parts')
    .insert([{ ...body, organization_id: organizationId }])
    .select()
    .single();

  if (error) throw error;

  console.log('[Job Plans Service] Part created:', data.id);
  
  return new Response(
    JSON.stringify(data),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updatePart(supabase: any, id: string, body: any, correlationId: string) {
  console.log('[Job Plans Service] Updating part:', id);
  
  const { data, error } = await supabase
    .from('job_plan_parts')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Part not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[Job Plans Service] Part updated');
  
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deletePart(supabase: any, id: string, correlationId: string) {
  console.log('[Job Plans Service] Deleting part:', id);
  
  const { error } = await supabase
    .from('job_plan_parts')
    .delete()
    .eq('id', id);

  if (error) throw error;

  console.log('[Job Plans Service] Part deleted');
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// Tool Operations
// ============================================================================

async function createTool(supabase: any, body: any, organizationId: string | null, correlationId: string) {
  console.log('[Job Plans Service] Creating tool');
  
  const { data, error } = await supabase
    .from('job_plan_tools')
    .insert([{ ...body, organization_id: organizationId }])
    .select()
    .single();

  if (error) throw error;

  console.log('[Job Plans Service] Tool created:', data.id);
  
  return new Response(
    JSON.stringify(data),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateTool(supabase: any, id: string, body: any, correlationId: string) {
  console.log('[Job Plans Service] Updating tool:', id);
  
  const { data, error } = await supabase
    .from('job_plan_tools')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Tool not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[Job Plans Service] Tool updated');
  
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteTool(supabase: any, id: string, correlationId: string) {
  console.log('[Job Plans Service] Deleting tool:', id);
  
  const { error } = await supabase
    .from('job_plan_tools')
    .delete()
    .eq('id', id);

  if (error) throw error;

  console.log('[Job Plans Service] Tool deleted');
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}