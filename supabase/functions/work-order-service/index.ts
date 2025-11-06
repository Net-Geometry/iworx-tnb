import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-organization-id',
};

interface WorkOrder {
  id?: string;
  asset_id: string;
  title: string;
  description?: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduled_date: string;
  estimated_duration_hours?: number;
  assigned_technician?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  estimated_cost?: number;
  notes?: string;
  organization_id: string;
  pm_schedule_id?: string;
  incident_report_id?: string;
  generation_type?: 'manual' | 'automatic';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract user and organization from headers (set by API Gateway)
    const userId = req.headers.get('x-user-id');
    const organizationId = req.headers.get('x-organization-id');
    const hasCrossProjectAccess = req.headers.get('x-cross-project-access') === 'true';

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p && p !== 'work-order-service');
    const method = req.method;

    console.log(`[Work Order Service] ${method} ${url.pathname}`, { userId, organizationId, hasCrossProjectAccess });

    // GET /work-orders - List all work orders
    if (method === 'GET' && pathParts.length === 0) {
      let query = supabase.from('work_orders').select('*');

      // Apply organization filter unless user has cross-project access
      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    /**
     * CRITICAL ROUTE ORDERING:
     * Specific routes (/stats) MUST come before parameterized routes (/:id)
     * to prevent path segments from being misinterpreted as UUIDs
     */
    
    // GET /work-orders/stats - Get work order statistics
    if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'stats') {
      let query = supabase.from('work_orders').select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const stats = {
        total: data.length,
        scheduled: data.filter(wo => wo.status === 'scheduled').length,
        in_progress: data.filter(wo => wo.status === 'in_progress').length,
        completed: data.filter(wo => wo.status === 'completed').length,
        overdue: data.filter(wo => 
          wo.status !== 'completed' && 
          wo.status !== 'cancelled' && 
          wo.scheduled_date < today
        ).length
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /work-orders/prioritized - Get AI-prioritized work orders
    if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'prioritized') {
      let query = supabase
        .from('work_orders')
        .select('*')
        .not('ai_priority_score', 'is', null)
        .order('ai_priority_score', { ascending: false })
        .limit(10);

      // Apply organization filter unless user has cross-project access
      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log(`[Work Order Service] Retrieved ${data.length} prioritized work orders`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /work-orders/:id - Get single work order
    if (method === 'GET' && pathParts.length === 1) {
      const workOrderId = pathParts[0];

      let query = supabase.from('work_orders').select('*').eq('id', workOrderId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /work-orders - Create new work order
    if (method === 'POST' && pathParts.length === 0) {
      const workOrder: WorkOrder = await req.json();

      // Ensure organization_id is set
      if (!workOrder.organization_id && organizationId) {
        workOrder.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .insert([workOrder])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Created work order: ${data.id}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /work-orders/:id - Update work order
    if (method === 'PUT' && pathParts.length === 1) {
      const workOrderId = pathParts[0];
      const updates = await req.json();

      let query = supabase
        .from('work_orders')
        .update(updates)
        .eq('id', workOrderId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      console.log(`[Work Order Service] Updated work order: ${workOrderId}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /work-orders/:id - Delete work order
    if (method === 'DELETE' && pathParts.length === 1 && pathParts[0] !== 'job-plans') {
      const workOrderId = pathParts[0];

      const { data, error } = await supabase.rpc('delete_work_order', {
        _work_order_id: workOrderId,
        _organization_id: hasCrossProjectAccess ? null : organizationId
      });

      if (error) {
        console.error('[Work Order Service] Delete error:', error);
        throw error;
      }

      if (!data) {
        return new Response(JSON.stringify({ error: 'Work order not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      console.log(`[Work Order Service] Deleted work order: ${workOrderId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ============================================================================
    // JOB PLANS ROUTES (consolidated from job-plans-service)
    // ============================================================================

    // GET /job-plans - List all job plans
    if (method === 'GET' && pathParts[0] === 'job-plans' && pathParts.length === 1) {
      let query = supabase.from('workorder_service.job_plans').select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /job-plans/stats - Get job plan statistics
    if (method === 'GET' && pathParts[0] === 'job-plans' && pathParts[1] === 'stats' && pathParts.length === 2) {
      let query = supabase.from('workorder_service.job_plans').select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(jp => jp.status === 'active').length,
        draft: data.filter(jp => jp.status === 'draft').length,
        inactive: data.filter(jp => jp.status === 'inactive').length,
        archived: data.filter(jp => jp.status === 'archived').length,
        by_type: {
          preventive: data.filter(jp => jp.job_type === 'preventive').length,
          corrective: data.filter(jp => jp.job_type === 'corrective').length,
          predictive: data.filter(jp => jp.job_type === 'predictive').length,
          emergency: data.filter(jp => jp.job_type === 'emergency').length,
          shutdown: data.filter(jp => jp.job_type === 'shutdown').length,
        }
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /job-plans/:id - Get single job plan with nested data
    if (method === 'GET' && pathParts[0] === 'job-plans' && pathParts.length === 2 && pathParts[1] !== 'stats') {
      const jobPlanId = pathParts[1];

      let query = supabase
        .from('workorder_service.job_plans')
        .select(`
          *,
          tasks:workorder_service.job_plan_tasks(*),
          parts:workorder_service.job_plan_parts(*),
          tools:workorder_service.job_plan_tools(*)
        `)
        .eq('id', jobPlanId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /job-plans - Create new job plan
    if (method === 'POST' && pathParts[0] === 'job-plans' && pathParts.length === 1) {
      const jobPlan = await req.json();

      if (!jobPlan.organization_id && organizationId) {
        jobPlan.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('workorder_service.job_plans')
        .insert([jobPlan])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Created job plan: ${data.id}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PATCH /job-plans/:id - Update job plan
    if (method === 'PATCH' && pathParts[0] === 'job-plans' && pathParts.length === 2) {
      const jobPlanId = pathParts[1];
      const updates = await req.json();

      let query = supabase
        .from('workorder_service.job_plans')
        .update(updates)
        .eq('id', jobPlanId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      console.log(`[Work Order Service] Updated job plan: ${jobPlanId}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /job-plans/:id - Delete job plan
    if (method === 'DELETE' && pathParts[0] === 'job-plans' && pathParts.length === 2) {
      const jobPlanId = pathParts[1];

      let query = supabase
        .from('workorder_service.job_plans')
        .delete()
        .eq('id', jobPlanId);

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { error } = await query;

      if (error) throw error;

      console.log(`[Work Order Service] Deleted job plan: ${jobPlanId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /job-plans/tasks - Create task
    if (method === 'POST' && pathParts[0] === 'job-plans' && pathParts[1] === 'tasks' && pathParts.length === 2) {
      const task = await req.json();

      if (!task.organization_id && organizationId) {
        task.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('workorder_service.job_plan_tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Created task: ${data.id}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PATCH /job-plans/tasks/:id - Update task
    if (method === 'PATCH' && pathParts[0] === 'job-plans' && pathParts[1] === 'tasks' && pathParts.length === 3) {
      const taskId = pathParts[2];
      const updates = await req.json();

      const { data, error } = await supabase
        .from('workorder_service.job_plan_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Updated task: ${taskId}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /job-plans/tasks/:id - Delete task
    if (method === 'DELETE' && pathParts[0] === 'job-plans' && pathParts[1] === 'tasks' && pathParts.length === 3) {
      const taskId = pathParts[2];

      const { error } = await supabase
        .from('workorder_service.job_plan_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      console.log(`[Work Order Service] Deleted task: ${taskId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /job-plans/parts - Create part
    if (method === 'POST' && pathParts[0] === 'job-plans' && pathParts[1] === 'parts' && pathParts.length === 2) {
      const part = await req.json();

      if (!part.organization_id && organizationId) {
        part.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('workorder_service.job_plan_parts')
        .insert([part])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Created part: ${data.id}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PATCH /job-plans/parts/:id - Update part
    if (method === 'PATCH' && pathParts[0] === 'job-plans' && pathParts[1] === 'parts' && pathParts.length === 3) {
      const partId = pathParts[2];
      const updates = await req.json();

      const { data, error } = await supabase
        .from('workorder_service.job_plan_parts')
        .update(updates)
        .eq('id', partId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Updated part: ${partId}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /job-plans/parts/:id - Delete part
    if (method === 'DELETE' && pathParts[0] === 'job-plans' && pathParts[1] === 'parts' && pathParts.length === 3) {
      const partId = pathParts[2];

      const { error } = await supabase
        .from('workorder_service.job_plan_parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;

      console.log(`[Work Order Service] Deleted part: ${partId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /job-plans/tools - Create tool
    if (method === 'POST' && pathParts[0] === 'job-plans' && pathParts[1] === 'tools' && pathParts.length === 2) {
      const tool = await req.json();

      if (!tool.organization_id && organizationId) {
        tool.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('workorder_service.job_plan_tools')
        .insert([tool])
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Created tool: ${data.id}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PATCH /job-plans/tools/:id - Update tool
    if (method === 'PATCH' && pathParts[0] === 'job-plans' && pathParts[1] === 'tools' && pathParts.length === 3) {
      const toolId = pathParts[2];
      const updates = await req.json();

      const { data, error } = await supabase
        .from('workorder_service.job_plan_tools')
        .update(updates)
        .eq('id', toolId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[Work Order Service] Updated tool: ${toolId}`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /job-plans/tools/:id - Delete tool
    if (method === 'DELETE' && pathParts[0] === 'job-plans' && pathParts[1] === 'tools' && pathParts.length === 3) {
      const toolId = pathParts[2];

      const { error } = await supabase
        .from('workorder_service.job_plan_tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      console.log(`[Work Order Service] Deleted tool: ${toolId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });

  } catch (error) {
    console.error('[Work Order Service] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
