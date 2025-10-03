import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Cost Insights] Starting refresh...');

    // Step 1: Refresh materialized view
    const { error: refreshError } = await supabase.rpc('refresh_cost_analysis_view');
    
    if (refreshError) {
      console.error('[Cost Insights] Refresh error:', refreshError);
      throw refreshError;
    }

    console.log('[Cost Insights] Materialized view refreshed');

    // Step 2: Fetch updated cost analysis
    const { data: costData } = await supabase
      .from('mv_vertical_cost_analysis')
      .select('*')
      .order('month', { ascending: false });

    if (!costData || costData.length === 0) {
      console.log('[Cost Insights] No cost data found');
      return new Response(JSON.stringify({ message: 'No data to analyze' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[Cost Insights] Fetched cost data for', costData.length, 'records');

    // Step 3: Generate monthly cost summary insight
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyData = costData.filter(d => d.month?.startsWith(currentMonth));

    if (monthlyData.length > 0) {
      const totalCost = monthlyData.reduce((sum, d) => 
        sum + (d.total_estimated_cost || 0) + (d.total_incident_cost || 0), 0
      );
      
      const totalWorkOrders = monthlyData.reduce((sum, d) => sum + (d.total_work_orders || 0), 0);
      const totalIncidents = monthlyData.reduce((sum, d) => sum + (d.total_incidents || 0), 0);

      const monthlySummary = `Cost Summary for ${currentMonth}: 
Total maintenance cost across all verticals: RM ${totalCost.toFixed(2)}. 
Work orders: ${totalWorkOrders} (${monthlyData.reduce((sum, d) => sum + (d.critical_work_orders || 0), 0)} critical). 
Safety incidents: ${totalIncidents} (${monthlyData.reduce((sum, d) => sum + (d.critical_incidents || 0), 0)} critical). 

Top spending vertical: ${monthlyData.sort((a, b) => 
  ((b.total_estimated_cost || 0) + (b.total_incident_cost || 0)) - 
  ((a.total_estimated_cost || 0) + (a.total_incident_cost || 0))
)[0]?.organization_name || 'N/A'}`;

      // Create embedding for monthly summary
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: monthlySummary,
        }),
      });

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Store monthly insight
      await supabase
        .from('cross_vertical_cost_insights')
        .upsert({
          insight_type: 'monthly_cost_summary',
          time_period: 'monthly',
          period_start: `${currentMonth}-01`,
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
          content: monthlySummary,
          embedding: embedding,
          data: {
            total_cost: totalCost,
            total_work_orders: totalWorkOrders,
            total_incidents: totalIncidents,
            verticals: monthlyData.map(d => ({
              name: d.organization_name,
              code: d.organization_code,
              cost: (d.total_estimated_cost || 0) + (d.total_incident_cost || 0),
              work_orders: d.total_work_orders,
              incidents: d.total_incidents,
            })),
          },
        }, {
          onConflict: 'insight_type,period_start,period_end'
        });

      console.log('[Cost Insights] Monthly summary created');
    }

    // Step 4: Generate efficiency analysis
    const last3Months = costData.filter(d => {
      const recordDate = new Date(d.month);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return recordDate >= threeMonthsAgo;
    });

    if (last3Months.length > 0) {
      const efficiencyData = last3Months.reduce((acc: any, record) => {
        const orgCode = record.organization_code;
        if (!acc[orgCode]) {
          acc[orgCode] = {
            name: record.organization_name,
            code: orgCode,
            total_work_orders: 0,
            completed_work_orders: 0,
            total_cost: 0,
          };
        }
        acc[orgCode].total_work_orders += record.total_work_orders || 0;
        acc[orgCode].completed_work_orders += record.completed_work_orders || 0;
        acc[orgCode].total_cost += (record.total_estimated_cost || 0) + (record.total_incident_cost || 0);
        return acc;
      }, {});

      const efficiencyResults = Object.values(efficiencyData).map((org: any) => ({
        ...org,
        completion_rate: org.total_work_orders > 0 
          ? ((org.completed_work_orders / org.total_work_orders) * 100).toFixed(2)
          : 0,
        cost_per_work_order: org.total_work_orders > 0
          ? (org.total_cost / org.total_work_orders).toFixed(2)
          : 0,
      })).sort((a, b) => parseFloat(b.completion_rate) - parseFloat(a.completion_rate));

      const efficiencySummary = `Efficiency Analysis (Last 3 months): 
Most efficient vertical: ${efficiencyResults[0]?.name || 'N/A'} (${efficiencyResults[0]?.completion_rate}% completion rate). 
Cost per work order range: RM ${efficiencyResults[efficiencyResults.length - 1]?.cost_per_work_order} - RM ${efficiencyResults[0]?.cost_per_work_order}. 
Average completion rate: ${(efficiencyResults.reduce((sum, r) => sum + parseFloat(r.completion_rate), 0) / efficiencyResults.length).toFixed(2)}%`;

      const effEmbeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: efficiencySummary,
        }),
      });

      const effEmbeddingData = await effEmbeddingResponse.json();
      const effEmbedding = effEmbeddingData.data[0].embedding;

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      await supabase
        .from('cross_vertical_cost_insights')
        .upsert({
          insight_type: 'efficiency_analysis',
          time_period: 'quarterly',
          period_start: threeMonthsAgo.toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
          content: efficiencySummary,
          embedding: effEmbedding,
          data: {
            verticals: efficiencyResults,
          },
        }, {
          onConflict: 'insight_type,period_start,period_end'
        });

      console.log('[Cost Insights] Efficiency analysis created');
    }

    console.log('[Cost Insights] Refresh completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Cost insights refreshed successfully',
      records_processed: costData.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Cost Insights] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
