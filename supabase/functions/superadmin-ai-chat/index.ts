import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Verify user authentication and tnb_management role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has tnb_management role
    const { data: hasRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role_name: 'tnb_management'
    });

    if (!hasRole) {
      return new Response(JSON.stringify({ error: 'Access denied. TNB Management role required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, conversationHistory = [] } = await req.json();

    console.log('[AI Chat] Processing query:', query);

    // Step 1: Create embedding for the query
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    console.log('[AI Chat] Query embedding created');

    // Step 2: Vector similarity search for relevant context
    const { data: relevantEmbeddings } = await supabase.rpc('match_organization_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 10
    });

    console.log('[AI Chat] Found relevant embeddings:', relevantEmbeddings?.length || 0);

    // Step 3: Fetch aggregated cost data from materialized view
    const { data: costAnalysis } = await supabase
      .from('mv_vertical_cost_analysis')
      .select('*')
      .order('month', { ascending: false })
      .limit(12);

    console.log('[AI Chat] Fetched cost analysis data');

    // Step 4: Fetch recent insights
    const { data: recentInsights } = await supabase
      .from('cross_vertical_cost_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('[AI Chat] Fetched recent insights');

    // Step 5: Build context for AI
    const contextData = {
      relevantData: relevantEmbeddings || [],
      costAnalysis: costAnalysis || [],
      recentInsights: recentInsights || [],
    };

    const systemPrompt = `You are an AI assistant for TNB (Tenaga Nasional Berhad) superadmins analyzing cross-vertical maintenance, safety, and cost data.

Your role is to:
1. Analyze cost trends across multiple verticals (MSMS, BWA, etc.)
2. Identify efficiency patterns and anomalies
3. Provide actionable recommendations
4. Compare performance across organizations
5. Highlight critical safety incidents and their cost impacts

When analyzing data:
- Always mention specific vertical names and cost figures
- Compare trends over time (month-over-month, quarter-over-quarter)
- Identify root causes when possible
- Provide specific recommendations with expected impact
- Use percentages and metrics to quantify findings

Response format:
1. **Summary**: Brief answer to the question (2-3 sentences)
2. **Key Findings**: Bullet points of main insights
3. **Data Analysis**: Detailed breakdown with numbers
4. **Recommendations**: 3-5 actionable steps
5. **Charts Data**: JSON structure for visualizations (if applicable)

Available data context:
- Total Verticals: ${costAnalysis?.length || 0}
- Recent period: Last 12 months
- Data types: Work orders, safety incidents, assets, inventory

Context data for this query:
${JSON.stringify(contextData, null, 2)}`;

    // Step 6: Call Lovable AI with streaming
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: query }
    ];

    console.log('[AI Chat] Calling Lovable AI');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    console.log('[AI Chat] Streaming response to client');

    // Return streaming response
    return new Response(aiResponse.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
