import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { createEventBus, DomainEvents } from "../_shared/event-bus.ts";
import { getOrCreateCorrelationId } from "../_shared/correlation.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * PM Schedules Microservice
 * Handles preventive maintenance scheduling, materials, assignments, and work order generation
 * 
 * Endpoints:
 * - GET    /               - List all PM schedules with enrichment
 * - GET    /:id            - Get single PM schedule with full enrichment
 * - POST   /               - Create new PM schedule
 * - PATCH  /:id            - Update PM schedule
 * - DELETE /:id            - Delete PM schedule
 * - GET    /stats          - Get PM statistics (KPIs)
 * - GET    /by-asset/:assetId - Get schedules for specific asset
 * - POST   /:id/generate-work-order - Generate work order from schedule
 * - POST   /:id/pause      - Pause/resume schedule
 * - GET    /:id/materials  - Get schedule materials
 * - POST   /:id/materials  - Add material to schedule
 * - PATCH  /materials/:materialId - Update material
 * - DELETE /materials/:materialId - Delete material
 * - GET    /:id/assignments - Get schedule assignments
 * - POST   /:id/assignments - Add person assignment
 * - PUT    /:id/assignments - Bulk update assignments
 * - DELETE /assignments/:assignmentId - Remove assignment
 * - GET    /:id/history    - Get completion history
 * - POST   /:id/history    - Record completion
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const eventBus = createEventBus("pm-schedules-service");
    const correlationId = getOrCreateCorrelationId(req);

    // Extract auth from headers
    const authHeader = req.headers.get("authorization");
    const userId = req.headers.get("x-user-id");
    const organizationId = req.headers.get("x-organization-id");

    if (!userId || !organizationId) {
      return new Response(
        JSON.stringify({ error: "Missing authentication headers" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const method = req.method;

    console.log(`[PM-Schedules] ${method} ${url.pathname}`, { userId, organizationId, correlationId });

    // Route: GET /stats
    if (method === "GET" && pathParts[0] === "stats") {
      const now = new Date().toISOString();
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const [active, overdue, dueThisWeek, completedThisMonth] = await Promise.all([
        supabase.from("pm_service.schedules").select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId).eq("is_active", true),
        supabase.from("pm_service.schedules").select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId).eq("is_active", true).lt("next_due_date", now),
        supabase.from("pm_service.schedules").select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId).eq("is_active", true)
          .gte("next_due_date", startOfWeek.toISOString()).lte("next_due_date", now),
        supabase.from("pm_service.schedule_history").select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId).gte("completed_date", startOfMonth.toISOString().split('T')[0])
      ]);

      return new Response(JSON.stringify({
        active: active.count || 0,
        overdue: overdue.count || 0,
        dueThisWeek: dueThisWeek.count || 0,
        completedThisMonth: completedThisMonth.count || 0
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Route: GET /by-asset/:assetId
    if (method === "GET" && pathParts[0] === "by-asset" && pathParts[1]) {
      const assetId = pathParts[1];
      const { data, error } = await supabase
        .from("pm_service.schedules")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("asset_id", assetId);

      if (error) throw error;

      // Enrich with related data
      const enriched = await Promise.all((data || []).map(async (schedule: any) => {
        const [assetData, jobPlanData, personData] = await Promise.all([
          schedule.asset_id ? supabase.from("assets").select("asset_number, name").eq("id", schedule.asset_id).single() : Promise.resolve({ data: null }),
          schedule.job_plan_id ? supabase.from("job_plans").select("job_plan_number, title").eq("id", schedule.job_plan_id).single() : Promise.resolve({ data: null }),
          schedule.assigned_to ? supabase.from("people").select("first_name, last_name").eq("id", schedule.assigned_to).single() : Promise.resolve({ data: null })
        ]);

        return {
          ...schedule,
          asset: assetData.data,
          job_plan: jobPlanData.data,
          assigned_person: personData.data
        };
      }));

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Route: POST /:id/generate-work-order
    if (method === "POST" && pathParts[1] === "generate-work-order") {
      const scheduleId = pathParts[0];

      const { data: schedule } = await supabase
        .from("pm_service.schedules")
        .select("*")
        .eq("id", scheduleId)
        .eq("organization_id", organizationId)
        .single();

      if (!schedule) {
        return new Response(JSON.stringify({ error: "Schedule not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Check for existing work order for this schedule and due date
      const { data: existingWO } = await supabase
        .from("work_orders")
        .select("id, title")
        .eq("pm_schedule_id", scheduleId)
        .eq("scheduled_date", schedule.next_due_date)
        .maybeSingle();

      if (existingWO) {
        console.warn('[PM-Schedules] Work order already exists:', { scheduleId, workOrderId: existingWO.id });
        return new Response(JSON.stringify({ 
          error: "Work order already exists for this schedule and date",
          workOrderId: existingWO.id 
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Create work order
      const { data: workOrder, error: woError } = await supabase
        .from("work_orders")
        .insert({
          title: schedule.title || schedule.schedule_number,
          description: schedule.description || `Generated from PM schedule ${schedule.schedule_number}`,
          asset_id: schedule.asset_id,
          job_plan_id: schedule.job_plan_id,
          priority: schedule.priority || "medium",
          status: "scheduled",
          maintenance_type: "preventive",
          estimated_duration_hours: schedule.estimated_duration_hours,
          scheduled_date: schedule.next_due_date,
          pm_schedule_id: scheduleId,
          generation_type: "manual",
          organization_id: organizationId,
          created_by: userId
        })
        .select()
        .single();

      if (woError) {
        console.error('[PM-Schedules] Error creating work order:', {
          error: woError,
          scheduleId,
          schedule: {
            title: schedule.title,
            schedule_number: schedule.schedule_number,
            asset_id: schedule.asset_id,
            job_plan_id: schedule.job_plan_id
          },
          correlationId
        });
        
        return new Response(JSON.stringify({ 
          error: 'Failed to create work order', 
          details: woError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Record in history
      await supabase.from("pm_service.schedule_history").insert({
        pm_schedule_id: scheduleId,
        work_order_id: workOrder.id,
        completed_date: new Date().toISOString().split('T')[0],
        completed_by: userId,
        organization_id: organizationId
      });

      // Update schedule next due date
      const nextDueDate = calculateNextDueDate(
        new Date(),
        schedule.frequency_type,
        schedule.frequency_value
      );

      await supabase.from("pm_service.schedules")
        .update({ 
          next_due_date: nextDueDate.toISOString().split('T')[0],
          last_completed_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", scheduleId);

      await eventBus.publish({
        eventType: DomainEvents.PM_WORK_ORDER_GENERATED,
        payload: { scheduleId, workOrderId: workOrder.id, organizationId },
        correlationId
      });

      return new Response(JSON.stringify(workOrder), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Route: POST /:id/pause
    if (method === "POST" && pathParts[1] === "pause") {
      const scheduleId = pathParts[0];
      const body = await req.json();
      const { is_active } = body;

      const { data, error } = await supabase
        .from("pm_service.schedules")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", scheduleId)
        .eq("organization_id", organizationId)
        .select()
        .single();

      if (error) throw error;

      await eventBus.publish({
        eventType: is_active ? DomainEvents.PM_SCHEDULE_RESUMED : DomainEvents.PM_SCHEDULE_PAUSED,
        payload: { scheduleId, organizationId },
        correlationId
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Materials routes
    if (pathParts.includes("materials")) {
      const idx = pathParts.indexOf("materials");
      
      if (method === "GET" && idx === 1) {
        // GET /:id/materials
        const scheduleId = pathParts[0];
        const { data, error } = await supabase
          .from("pm_service.materials")
          .select("*")
          .eq("pm_schedule_id", scheduleId)
          .eq("organization_id", organizationId);

        if (error) throw error;

        // Enrich with BOM item details
        const enriched = await Promise.all((data || []).map(async (material: any) => {
          const { data: bomItem } = await supabase
            .from("bom_items")
            .select("item_name, item_number, unit, cost_per_unit")
            .eq("id", material.bom_item_id)
            .single();

          return { ...material, bom_items: bomItem };
        }));

        return new Response(JSON.stringify(enriched), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "POST" && idx === 1) {
        // POST /:id/materials
        const scheduleId = pathParts[0];
        const body = await req.json();

        const { data, error } = await supabase
          .from("pm_service.materials")
          .insert({ ...body, pm_schedule_id: scheduleId, organization_id: organizationId })
          .select()
          .single();

        if (error) throw error;

        await eventBus.publish({
          eventType: DomainEvents.PM_MATERIAL_ASSIGNED,
          payload: { scheduleId, materialId: data.id, organizationId },
          correlationId
        });

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "PATCH" && idx === 0 && pathParts[1]) {
        // PATCH /materials/:materialId
        const materialId = pathParts[1];
        const body = await req.json();

        const { data, error } = await supabase
          .from("pm_service.materials")
          .update(body)
          .eq("id", materialId)
          .eq("organization_id", organizationId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "DELETE" && idx === 0 && pathParts[1]) {
        // DELETE /materials/:materialId
        const materialId = pathParts[1];

        const { error } = await supabase
          .from("pm_service.materials")
          .delete()
          .eq("id", materialId)
          .eq("organization_id", organizationId);

        if (error) throw error;

        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    // Assignments routes
    if (pathParts.includes("assignments")) {
      const idx = pathParts.indexOf("assignments");

      if (method === "GET" && idx === 1) {
        // GET /:id/assignments
        const scheduleId = pathParts[0];
        const { data, error } = await supabase
          .from("pm_service.assignments")
          .select("*")
          .eq("pm_schedule_id", scheduleId)
          .eq("organization_id", organizationId);

        if (error) throw error;

        // Enrich with person details
        const enriched = await Promise.all((data || []).map(async (assignment: any) => {
          const { data: person } = await supabase
            .from("people")
            .select("first_name, last_name, email")
            .eq("id", assignment.assigned_person_id)
            .single();

          return { ...assignment, person };
        }));

        return new Response(JSON.stringify(enriched), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "POST" && idx === 1) {
        // POST /:id/assignments
        const scheduleId = pathParts[0];
        const body = await req.json();

        const { data, error } = await supabase
          .from("pm_service.assignments")
          .insert({ ...body, pm_schedule_id: scheduleId, organization_id: organizationId, assigned_by: userId })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "PUT" && idx === 1) {
        // PUT /:id/assignments - bulk update
        const scheduleId = pathParts[0];
        const body = await req.json();
        const { assignedPersonIds } = body;

        // Delete existing
        await supabase
          .from("pm_service.assignments")
          .delete()
          .eq("pm_schedule_id", scheduleId)
          .eq("organization_id", organizationId);

        // Insert new
        if (assignedPersonIds && assignedPersonIds.length > 0) {
          const assignments = assignedPersonIds.map((personId: string, idx: number) => ({
            pm_schedule_id: scheduleId,
            assigned_person_id: personId,
            assignment_role: idx === 0 ? "primary" : "assigned",
            organization_id: organizationId,
            assigned_by: userId
          }));

          await supabase.from("pm_service.assignments").insert(assignments);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "DELETE" && idx === 0 && pathParts[1]) {
        // DELETE /assignments/:assignmentId
        const assignmentId = pathParts[1];

        const { error } = await supabase
          .from("pm_service.assignments")
          .delete()
          .eq("id", assignmentId)
          .eq("organization_id", organizationId);

        if (error) throw error;

        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    // History routes
    if (pathParts.includes("history")) {
      const idx = pathParts.indexOf("history");

      if (method === "GET" && idx === 1) {
        // GET /:id/history
        const scheduleId = pathParts[0];
        const { data, error } = await supabase
          .from("pm_service.schedule_history")
          .select("*")
          .eq("pm_schedule_id", scheduleId)
          .eq("organization_id", organizationId)
          .order("completed_date", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (method === "POST" && idx === 1) {
        // POST /:id/history
        const scheduleId = pathParts[0];
        const body = await req.json();

        const { data, error } = await supabase
          .from("pm_service.schedule_history")
          .insert({ ...body, pm_schedule_id: scheduleId, organization_id: organizationId })
          .select()
          .single();

        if (error) throw error;

        await eventBus.publish({
          eventType: DomainEvents.PM_SCHEDULE_COMPLETED,
          payload: { scheduleId, historyId: data.id, organizationId },
          correlationId
        });

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Main CRUD routes
    if (method === "GET" && pathParts.length === 0) {
      // GET / - List all schedules
      const { data, error } = await supabase
        .from("pm_service.schedules")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with related data
      const enriched = await Promise.all((data || []).map(async (schedule: any) => {
        const [assetData, jobPlanData, personData] = await Promise.all([
          schedule.asset_id ? supabase.from("assets").select("asset_number, name").eq("id", schedule.asset_id).single() : Promise.resolve({ data: null }),
          schedule.job_plan_id ? supabase.from("job_plans").select("job_plan_number, title").eq("id", schedule.job_plan_id).single() : Promise.resolve({ data: null }),
          schedule.assigned_to ? supabase.from("people").select("first_name, last_name").eq("id", schedule.assigned_to).single() : Promise.resolve({ data: null })
        ]);

        return {
          ...schedule,
          asset: assetData.data,
          job_plan: jobPlanData.data,
          assigned_person: personData.data
        };
      }));

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (method === "GET" && pathParts.length === 1) {
      // GET /:id - Get single schedule
      const scheduleId = pathParts[0];
      const { data: schedule, error } = await supabase
        .from("pm_service.schedules")
        .select("*")
        .eq("id", scheduleId)
        .eq("organization_id", organizationId)
        .single();

      if (error) throw error;

      // Enrich
      const [assetData, jobPlanData, personData, routeData] = await Promise.all([
        schedule.asset_id ? supabase.from("assets").select("*").eq("id", schedule.asset_id).single() : Promise.resolve({ data: null }),
        schedule.job_plan_id ? supabase.from("job_plans").select("*").eq("id", schedule.job_plan_id).single() : Promise.resolve({ data: null }),
        schedule.assigned_to ? supabase.from("people").select("*").eq("id", schedule.assigned_to).single() : Promise.resolve({ data: null }),
        supabase.from("route_pm_schedule_assignments").select("*, maintenance_routes(*)").eq("pm_schedule_id", scheduleId)
      ]);

      const enriched = {
        ...schedule,
        asset: assetData.data,
        job_plan: jobPlanData.data,
        assigned_person: personData.data,
        route_assignments: routeData.data || []
      };

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (method === "POST" && pathParts.length === 0) {
      // POST / - Create schedule
      const body = await req.json();

      // Generate schedule number
      const { count } = await supabase.from("pm_service.schedules")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);

      const scheduleNumber = `PM-${String((count || 0) + 1).padStart(6, '0')}`;

      const { data, error } = await supabase
        .from("pm_service.schedules")
        .insert({
          ...body,
          schedule_number: scheduleNumber,
          organization_id: organizationId,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      await eventBus.publish({
        eventType: DomainEvents.PM_SCHEDULE_CREATED,
        payload: { scheduleId: data.id, organizationId },
        correlationId
      });

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (method === "PATCH" && pathParts.length === 1) {
      // PATCH /:id - Update schedule
      const scheduleId = pathParts[0];
      const body = await req.json();

      const { data, error } = await supabase
        .from("pm_service.schedules")
        .update({ ...body, updated_by: userId })
        .eq("id", scheduleId)
        .eq("organization_id", organizationId)
        .select()
        .single();

      if (error) throw error;

      await eventBus.publish({
        eventType: DomainEvents.PM_SCHEDULE_UPDATED,
        payload: { scheduleId, organizationId },
        correlationId
      });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (method === "DELETE" && pathParts.length === 1) {
      // DELETE /:id - Delete schedule
      const scheduleId = pathParts[0];

      const { error } = await supabase
        .from("pm_service.schedules")
        .delete()
        .eq("id", scheduleId)
        .eq("organization_id", organizationId);

      if (error) throw error;

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[PM-Schedules] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Utility function to calculate next due date
function calculateNextDueDate(startDate: Date, frequencyType: string, frequencyValue: number): Date {
  const date = new Date(startDate);
  
  switch (frequencyType.toLowerCase()) {
    case "daily":
      date.setDate(date.getDate() + frequencyValue);
      break;
    case "weekly":
      date.setDate(date.getDate() + (frequencyValue * 7));
      break;
    case "monthly":
      date.setMonth(date.getMonth() + frequencyValue);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + (frequencyValue * 3));
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + frequencyValue);
      break;
    default:
      date.setMonth(date.getMonth() + frequencyValue);
  }
  
  return date;
}
