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
    if (method === 'DELETE' && pathParts.length === 1) {
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
