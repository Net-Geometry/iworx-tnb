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

    // PATCH /work-orders/:id - Update work order
    if (method === 'PATCH' && pathParts.length === 1) {
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
      console.log('[Work Order Service] Fetching job plans for organization:', organizationId);
      
      let query = supabase.from('workorder_service.job_plans').select('*');

      if (!hasCrossProjectAccess && organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('[Work Order Service] Error fetching job plans:', error);
        throw error;
      }

      console.log('[Work Order Service] Successfully fetched job plans:', data?.length || 0);
      console.log('[Work Order Service] Sample job plan:', data?.[0]?.job_plan_number);

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
        .from('job_plans')
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
        .from('job_plan_tasks')
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
        .from('job_plan_tasks')
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
        .from('job_plan_tasks')
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
        .from('job_plan_parts')
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
        .from('job_plan_parts')
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
        .from('job_plan_parts')
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
        .from('job_plan_tools')
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
        .from('job_plan_tools')
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
        .from('job_plan_tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      console.log(`[Work Order Service] Deleted tool: ${toolId}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ========================================================================
    // PM SCHEDULES ROUTES
    // ========================================================================
    
    // PM Schedules: GET /pm-schedules/stats
    if (method === 'GET' && pathParts[0] === 'pm-schedules' && pathParts[1] === 'stats') {
      const now = new Date().toISOString();
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const [active, overdue, dueThisWeek, completedThisMonth] = await Promise.all([
        supabase.from('pm_schedules').select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId).eq('is_active', true),
        supabase.from('pm_schedules').select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId).eq('is_active', true).lt('next_due_date', now),
        supabase.from('pm_schedules').select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId).eq('is_active', true)
          .gte('next_due_date', startOfWeek.toISOString()).lte('next_due_date', now),
        supabase.from('pm_schedule_history').select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId).gte('completed_date', startOfMonth.toISOString().split('T')[0])
      ]);

      return new Response(JSON.stringify({
        active: active.count || 0,
        overdue: overdue.count || 0,
        dueThisWeek: dueThisWeek.count || 0,
        completedThisMonth: completedThisMonth.count || 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // PM Schedules: GET /pm-schedules/by-asset/:assetId
    if (method === 'GET' && pathParts[0] === 'pm-schedules' && pathParts[1] === 'by-asset' && pathParts[2]) {
      const assetId = pathParts[2];
      const { data, error } = await supabase
        .from('pm_schedules')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('asset_id', assetId);

      if (error) throw error;

      // Enrich with related data
      const enriched = await Promise.all((data || []).map(async (schedule: any) => {
        const [assetData, jobPlanData, personData] = await Promise.all([
          schedule.asset_id ? supabase.from('assets').select('asset_number, name').eq('id', schedule.asset_id).single() : Promise.resolve({ data: null }),
          schedule.job_plan_id ? supabase.from('job_plans').select('job_plan_number, title').eq('id', schedule.job_plan_id).single() : Promise.resolve({ data: null }),
          schedule.assigned_to ? supabase.from('people').select('first_name, last_name').eq('id', schedule.assigned_to).single() : Promise.resolve({ data: null })
        ]);

        return {
          ...schedule,
          asset: assetData.data,
          job_plan: jobPlanData.data,
          assigned_person: personData.data
        };
      }));

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PM Schedules: POST /pm-schedules/:id/generate-work-order
    if (method === 'POST' && pathParts[0] === 'pm-schedules' && pathParts[2] === 'generate-work-order') {
      const scheduleId = pathParts[1];

      const { data: schedule } = await supabase
        .from('pm_schedules')
        .select('*')
        .eq('id', scheduleId)
        .eq('organization_id', organizationId)
        .single();

      if (!schedule) {
        return new Response(JSON.stringify({ error: 'Schedule not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check for existing work order
      const { data: existingWO } = await supabase
        .from('work_orders')
        .select('id, title')
        .eq('pm_schedule_id', scheduleId)
        .eq('scheduled_date', schedule.next_due_date)
        .maybeSingle();

      if (existingWO) {
        return new Response(JSON.stringify({ 
          error: 'Work order already exists for this schedule and date',
          workOrderId: existingWO.id 
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create work order
      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .insert({
          title: schedule.title || schedule.schedule_number,
          description: schedule.description || `Generated from PM schedule ${schedule.schedule_number}`,
          asset_id: schedule.asset_id,
          job_plan_id: schedule.job_plan_id,
          priority: schedule.priority || 'medium',
          status: 'scheduled',
          maintenance_type: 'preventive',
          work_order_type: 'pm',
          estimated_duration_hours: schedule.estimated_duration_hours,
          scheduled_date: schedule.next_due_date,
          pm_schedule_id: scheduleId,
          generation_type: 'manual',
          organization_id: organizationId
        })
        .select()
        .single();

      if (woError) throw woError;

      // Record in history
      await supabase.from('pm_schedule_history').insert({
        pm_schedule_id: scheduleId,
        work_order_id: workOrder.id,
        completed_date: new Date().toISOString().split('T')[0],
        completed_by: userId,
        organization_id: organizationId
      });

      // Update schedule next due date
      const nextDueDate = calculateNextDueDate(new Date(), schedule.frequency_type, schedule.frequency_value);

      await supabase.from('pm_schedules')
        .update({ 
          next_due_date: nextDueDate.toISOString().split('T')[0],
          last_completed_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', scheduleId);

      return new Response(JSON.stringify(workOrder), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PM Schedules: POST /pm-schedules/:id/pause
    if (method === 'POST' && pathParts[0] === 'pm-schedules' && pathParts[2] === 'pause') {
      const scheduleId = pathParts[1];
      const body = await req.json();
      const { is_active } = body;

      const { data, error } = await supabase
        .from('pm_schedules')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', scheduleId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PM Schedules Materials Routes
    if (pathParts[0] === 'pm-schedules' && pathParts.includes('materials')) {
      const materialsIdx = pathParts.indexOf('materials');
      
      // GET /pm-schedules/:id/materials
      if (method === 'GET' && materialsIdx === 2) {
        const scheduleId = pathParts[1];
        const { data, error } = await supabase
          .from('pm_schedule_materials')
          .select('*')
          .eq('pm_schedule_id', scheduleId)
          .eq('organization_id', organizationId);

        if (error) throw error;

        // Enrich with BOM item details
        const enriched = await Promise.all((data || []).map(async (material: any) => {
          const { data: bomItem } = await supabase
            .from('bom_items')
            .select('item_name, item_number, unit, cost_per_unit')
            .eq('id', material.bom_item_id)
            .single();

          return { ...material, bom_items: bomItem };
        }));

        return new Response(JSON.stringify(enriched), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST /pm-schedules/:id/materials
      if (method === 'POST' && materialsIdx === 2) {
        const scheduleId = pathParts[1];
        const body = await req.json();

        const { data, error } = await supabase
          .from('pm_schedule_materials')
          .insert({ ...body, pm_schedule_id: scheduleId, organization_id: organizationId })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // PATCH /pm-schedules/materials/:materialId
      if (method === 'PATCH' && materialsIdx === 1 && pathParts[2]) {
        const materialId = pathParts[2];
        const body = await req.json();

        const { data, error } = await supabase
          .from('pm_schedule_materials')
          .update(body)
          .eq('id', materialId)
          .eq('organization_id', organizationId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE /pm-schedules/materials/:materialId
      if (method === 'DELETE' && materialsIdx === 1 && pathParts[2]) {
        const materialId = pathParts[2];

        const { error } = await supabase
          .from('pm_schedule_materials')
          .delete()
          .eq('id', materialId)
          .eq('organization_id', organizationId);

        if (error) throw error;

        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    // PM Schedules Assignments Routes
    if (pathParts[0] === 'pm-schedules' && pathParts.includes('assignments')) {
      const assignmentsIdx = pathParts.indexOf('assignments');

      // GET /pm-schedules/:id/assignments
      if (method === 'GET' && assignmentsIdx === 2) {
        const scheduleId = pathParts[1];
        const { data, error } = await supabase
          .from('pm_schedule_assignments')
          .select('*')
          .eq('pm_schedule_id', scheduleId)
          .eq('organization_id', organizationId);

        if (error) throw error;

        // Enrich with person details
        const enriched = await Promise.all((data || []).map(async (assignment: any) => {
          const { data: person } = await supabase
            .from('people')
            .select('first_name, last_name, email')
            .eq('id', assignment.assigned_person_id)
            .single();

          return { ...assignment, person };
        }));

        return new Response(JSON.stringify(enriched), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST /pm-schedules/:id/assignments
      if (method === 'POST' && assignmentsIdx === 2) {
        const scheduleId = pathParts[1];
        const body = await req.json();

        const { data, error } = await supabase
          .from('pm_schedule_assignments')
          .insert({ ...body, pm_schedule_id: scheduleId, organization_id: organizationId, assigned_by: userId })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // PUT /pm-schedules/:id/assignments - bulk update
      if (method === 'PUT' && assignmentsIdx === 2) {
        const scheduleId = pathParts[1];
        const body = await req.json();
        const { assignedPersonIds } = body;

        // Delete existing
        await supabase
          .from('pm_schedule_assignments')
          .delete()
          .eq('pm_schedule_id', scheduleId)
          .eq('organization_id', organizationId);

        // Insert new
        if (assignedPersonIds && assignedPersonIds.length > 0) {
          const assignments = assignedPersonIds.map((personId: string, idx: number) => ({
            pm_schedule_id: scheduleId,
            assigned_person_id: personId,
            assignment_role: idx === 0 ? 'primary' : 'assigned',
            organization_id: organizationId,
            assigned_by: userId
          }));

          await supabase.from('pm_schedule_assignments').insert(assignments);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE /pm-schedules/assignments/:assignmentId
      if (method === 'DELETE' && assignmentsIdx === 1 && pathParts[2]) {
        const assignmentId = pathParts[2];

        const { error } = await supabase
          .from('pm_schedule_assignments')
          .delete()
          .eq('id', assignmentId)
          .eq('organization_id', organizationId);

        if (error) throw error;

        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    // PM Schedules History Routes
    if (pathParts[0] === 'pm-schedules' && pathParts.includes('history')) {
      const historyIdx = pathParts.indexOf('history');

      // GET /pm-schedules/:id/history
      if (method === 'GET' && historyIdx === 2) {
        const scheduleId = pathParts[1];
        const { data, error } = await supabase
          .from('pm_schedule_history')
          .select('*')
          .eq('pm_schedule_id', scheduleId)
          .eq('organization_id', organizationId)
          .order('completed_date', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST /pm-schedules/:id/history
      if (method === 'POST' && historyIdx === 2) {
        const scheduleId = pathParts[1];
        const body = await req.json();

        const { data, error } = await supabase
          .from('pm_schedule_history')
          .insert({ ...body, pm_schedule_id: scheduleId, organization_id: organizationId })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // PM Schedules Main CRUD Routes
    
    // GET /pm-schedules - List all schedules
    if (method === 'GET' && pathParts[0] === 'pm-schedules' && pathParts.length === 1) {
      const { data, error } = await supabase
        .from('pm_schedules')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[PM Schedules] Fetched schedules:', data?.length);

      // Batch fetch related data to avoid N+1 queries
      const assetIds = [...new Set(data?.filter(s => s.asset_id).map(s => s.asset_id) || [])];
      const jobPlanIds = [...new Set(data?.filter(s => s.job_plan_id).map(s => s.job_plan_id) || [])];
      const personIds = [...new Set(data?.filter(s => s.assigned_to).map(s => s.assigned_to) || [])];

      console.log('[PM Schedules] Asset IDs to fetch:', assetIds.length);
      console.log('[PM Schedules] Job Plan IDs to fetch:', jobPlanIds.length);
      console.log('[PM Schedules] Person IDs to fetch:', personIds.length);

      const [assetsData, jobPlansData, peopleData] = await Promise.all([
        assetIds.length > 0 
          ? supabase.from('assets').select('id, asset_number, name').in('id', assetIds).then(r => {
              console.log('[PM Schedules] Fetched assets:', r.data?.length, 'Error:', r.error);
              return r.data || [];
            })
          : Promise.resolve([]),
        jobPlanIds.length > 0 
          ? supabase.from('job_plans').select('id, job_plan_number, title').in('id', jobPlanIds).then(r => {
              console.log('[PM Schedules] Fetched job plans:', r.data?.length, 'Error:', r.error);
              return r.data || [];
            })
          : Promise.resolve([]),
        personIds.length > 0 
          ? supabase.from('people').select('id, first_name, last_name').in('id', personIds).then(r => {
              console.log('[PM Schedules] Fetched people:', r.data?.length, 'Error:', r.error);
              return r.data || [];
            })
          : Promise.resolve([]),
      ]);

      // Client-side join with fetched data
      const enriched = data?.map((schedule: any) => ({
        ...schedule,
        asset: assetsData.find(a => a.id === schedule.asset_id) || null,
        job_plan: jobPlansData.find(j => j.id === schedule.job_plan_id) || null,
        assigned_person: peopleData.find(p => p.id === schedule.assigned_to) || null
      })) || [];

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /pm-schedules/:id - Get single schedule
    if (method === 'GET' && pathParts[0] === 'pm-schedules' && pathParts.length === 2 && 
        !['stats', 'by-asset'].includes(pathParts[1])) {
      const scheduleId = pathParts[1];
      const { data: schedule, error } = await supabase
        .from('pm_schedules')
        .select('*')
        .eq('id', scheduleId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;

      // Enrich
      const [assetData, jobPlanData, personData, routeData] = await Promise.all([
        schedule.asset_id ? supabase.from('assets').select('*').eq('id', schedule.asset_id).single() : Promise.resolve({ data: null }),
        schedule.job_plan_id ? supabase.from('job_plans').select('*').eq('id', schedule.job_plan_id).single() : Promise.resolve({ data: null }),
        schedule.assigned_to ? supabase.from('people').select('*').eq('id', schedule.assigned_to).single() : Promise.resolve({ data: null }),
        supabase.from('route_pm_schedule_assignments').select('*, maintenance_routes(*)').eq('pm_schedule_id', scheduleId)
      ]);

      const enriched = {
        ...schedule,
        asset: assetData.data,
        job_plan: jobPlanData.data,
        assigned_person: personData.data,
        route_assignments: routeData.data || []
      };

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /pm-schedules - Create schedule
    if (method === 'POST' && pathParts[0] === 'pm-schedules' && pathParts.length === 1) {
      const body = await req.json();

      // Generate schedule number
      const { count } = await supabase.from('pm_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      const scheduleNumber = `PM-${String((count || 0) + 1).padStart(6, '0')}`;

      const { data, error } = await supabase
        .from('pm_schedules')
        .insert({
          ...body,
          schedule_number: scheduleNumber,
          organization_id: organizationId,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PATCH /pm-schedules/:id - Update schedule
    if (method === 'PATCH' && pathParts[0] === 'pm-schedules' && pathParts.length === 2) {
      const scheduleId = pathParts[1];
      const body = await req.json();

      const { data, error } = await supabase
        .from('pm_schedules')
        .update({ ...body, updated_by: userId })
        .eq('id', scheduleId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /pm-schedules/:id - Delete schedule
    if (method === 'DELETE' && pathParts[0] === 'pm-schedules' && pathParts.length === 2) {
      const scheduleId = pathParts[1];

      const { error } = await supabase
        .from('pm_schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ========================================================================
    // NOT FOUND
    // ========================================================================
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate next due date for PM schedule based on frequency
 */
function calculateNextDueDate(startDate: Date, frequencyType: string, frequencyValue: number): Date {
  const date = new Date(startDate);
  
  switch (frequencyType.toLowerCase()) {
    case 'daily':
      date.setDate(date.getDate() + frequencyValue);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (frequencyValue * 7));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + frequencyValue);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (frequencyValue * 3));
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + frequencyValue);
      break;
    default:
      date.setMonth(date.getMonth() + frequencyValue);
  }
  
  return date;
}
