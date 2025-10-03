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

    const { entityType, entityId, forceRefresh = false } = await req.json();

    console.log(`[Embeddings] Processing ${entityType} ${entityId}`);

    // Check if embedding already exists (unless force refresh)
    if (!forceRefresh) {
      const { data: existing } = await supabase
        .from('organization_data_embeddings')
        .select('id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .single();

      if (existing) {
        console.log('[Embeddings] Embedding already exists, skipping');
        return new Response(JSON.stringify({ message: 'Embedding already exists' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch entity data based on type
    let entityData: any = null;
    let content = '';
    let metadata: any = {};

    switch (entityType) {
      case 'work_order': {
        const { data } = await supabase
          .from('work_orders')
          .select(`
            *,
            organizations(name, code),
            assets(name, asset_number)
          `)
          .eq('id', entityId)
          .single();
        
        entityData = data;
        
        if (data) {
          content = `Work Order ${data.work_order_number} for ${data.organizations?.name || 'Unknown'} - ${data.title}. 
Priority: ${data.priority}. Status: ${data.status}. 
Estimated cost: RM ${data.estimated_cost || 0}. 
Asset: ${data.assets?.name || 'N/A'}. 
Description: ${data.description || 'No description'}`;
          
          metadata = {
            cost: data.estimated_cost,
            priority: data.priority,
            status: data.status,
            created_at: data.created_at,
            organization_code: data.organizations?.code,
          };
        }
        break;
      }

      case 'incident': {
        const { data } = await supabase
          .from('safety_incidents')
          .select(`
            *,
            organizations(name, code)
          `)
          .eq('id', entityId)
          .single();
        
        entityData = data;
        
        if (data) {
          content = `Safety Incident ${data.incident_number} at ${data.organizations?.name || 'Unknown'} - ${data.title}. 
Severity: ${data.severity}. Status: ${data.status}. 
Cost estimate: RM ${data.cost_estimate || 0}. 
Incident date: ${data.incident_date}. 
Description: ${data.description || 'No description'}. 
Root cause: ${data.root_cause_analysis || 'Not analyzed'}`;
          
          metadata = {
            cost: data.cost_estimate,
            severity: data.severity,
            status: data.status,
            incident_date: data.incident_date,
            organization_code: data.organizations?.code,
          };
        }
        break;
      }

      case 'asset': {
        const { data } = await supabase
          .from('assets')
          .select(`
            *,
            organizations(name, code)
          `)
          .eq('id', entityId)
          .single();
        
        entityData = data;
        
        if (data) {
          content = `Asset ${data.asset_number} - ${data.name} at ${data.organizations?.name || 'Unknown'}. 
Type: ${data.type}. Category: ${data.category}. 
Criticality: ${data.criticality}. Status: ${data.status}. 
Health score: ${data.health_score || 'N/A'}. 
Purchase cost: RM ${data.purchase_cost || 0}. 
Last maintenance: ${data.last_maintenance_date || 'Never'}`;
          
          metadata = {
            cost: data.purchase_cost,
            criticality: data.criticality,
            status: data.status,
            health_score: data.health_score,
            organization_code: data.organizations?.code,
          };
        }
        break;
      }

      case 'inventory': {
        const { data } = await supabase
          .from('inventory_items')
          .select(`
            *,
            organizations(name, code)
          `)
          .eq('id', entityId)
          .single();
        
        entityData = data;
        
        if (data) {
          content = `Inventory item ${data.item_number} - ${data.name} at ${data.organizations?.name || 'Unknown'}. 
Category: ${data.category}. 
Current stock: ${data.current_stock} ${data.unit_of_measure}. 
Unit cost: RM ${data.unit_cost}. 
Total value: RM ${(data.current_stock || 0) * (data.unit_cost || 0)}. 
Reorder point: ${data.reorder_point}`;
          
          metadata = {
            cost: data.unit_cost,
            stock: data.current_stock,
            category: data.category,
            organization_code: data.organizations?.code,
          };
        }
        break;
      }

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    if (!entityData) {
      throw new Error(`Entity not found: ${entityType} ${entityId}`);
    }

    // Create embedding
    console.log('[Embeddings] Creating embedding for:', content.substring(0, 100) + '...');

    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: content,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Store embedding
    const { error: insertError } = await supabase
      .from('organization_data_embeddings')
      .upsert({
        organization_id: entityData.organization_id,
        entity_type: entityType,
        entity_id: entityId,
        content: content,
        embedding: embedding,
        metadata: metadata,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'entity_type,entity_id'
      });

    if (insertError) {
      console.error('[Embeddings] Insert error:', insertError);
      throw insertError;
    }

    console.log('[Embeddings] Successfully created embedding');

    return new Response(JSON.stringify({ 
      success: true,
      message: `Embedding created for ${entityType} ${entityId}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Embeddings] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
