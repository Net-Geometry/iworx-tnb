/**
 * Predictive Maintenance AI Service
 * 
 * Edge function for conversational AI assistant that helps with:
 * - Asset health predictions and analysis
 * - Anomaly detection insights
 * - Work order prioritization recommendations
 * - Maintenance planning optimization
 * 
 * Uses Lovable AI (Gemini 2.5 Flash) with function calling
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getOrCreateCorrelationId, logWithCorrelation } from "../_shared/correlation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = getOrCreateCorrelationId(req);
  const startTime = Date.now();

  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's organization with fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    let organizationId = profile?.current_organization_id;

    // Fallback: If null, get first organization and auto-update profile
    if (!organizationId) {
      logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'warn',
        `User ${user.id} has null current_organization_id, attempting fallback`);

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (userOrg?.organization_id) {
        organizationId = userOrg.organization_id;
        
        // Auto-fix the profile
        await supabase
          .from('profiles')
          .update({ current_organization_id: organizationId })
          .eq('id', user.id);

        logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'info',
          `Auto-set current_organization_id to ${organizationId} for user ${user.id}`);
      } else {
        throw new Error('No organization found');
      }
    }

    const { messages, action } = await req.json();

    logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'info', 
      `Processing request for user ${user.id}, org ${organizationId}, action: ${action || 'chat'}`);

    // Handle different actions
    if (action === 'get_asset_health') {
      return await handleGetAssetHealth(supabase, organizationId, correlationId);
    } else if (action === 'get_anomalies') {
      return await handleGetAnomalies(supabase, organizationId, correlationId);
    } else if (action === 'prioritize_work_orders') {
      return await handlePrioritizeWorkOrders(supabase, organizationId, correlationId);
    }

    // Chat with streaming
    return await handleChatStream(supabase, user.id, organizationId, messages, correlationId, startTime);

  } catch (error) {
    logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'error', 
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Handle streaming chat with AI using function calling
 */
async function handleChatStream(
  supabase: any,
  userId: string,
  organizationId: string,
  messages: any[],
  correlationId: string,
  startTime: number
) {
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  // System prompt for predictive maintenance context
  const systemPrompt = `You are an expert AI assistant for predictive maintenance in industrial asset management. 

Your capabilities:
- Analyze asset health scores and predict failures
- Identify patterns in meter readings and detect anomalies  
- Prioritize work orders based on risk and business impact
- Recommend maintenance strategies to optimize asset performance
- Explain complex maintenance concepts clearly

When analyzing data:
- Always consider safety implications first
- Look for patterns that indicate degrading performance
- Explain your reasoning and confidence levels
- Suggest actionable next steps

Be concise, technical when needed, but always explain implications clearly.`;

  // Available tools for the AI
  const tools = [
    {
      type: "function",
      function: {
        name: "getAssetHealthPrediction",
        description: "Get ML health predictions and failure probabilities for a specific asset. Returns health score (0-100), failure probabilities for 30/60/90 days, and contributing factors.",
        parameters: {
          type: "object",
          properties: {
            asset_id: { type: "string", description: "UUID of the asset to analyze" }
          },
          required: ["asset_id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "analyzeMeterTrends",
        description: "Analyze meter readings and detect anomalies for an asset. Returns recent anomalies with severity levels and descriptions.",
        parameters: {
          type: "object",
          properties: {
            asset_id: { type: "string", description: "UUID of the asset" },
            days_back: { type: "number", description: "Number of days to analyze (default 30)" }
          },
          required: ["asset_id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "getWorkOrderPriorities",
        description: "Get AI-prioritized work orders based on failure risk, business impact, and urgency. Returns sorted list with priority scores and explanations.",
        parameters: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Max number of work orders to return (default 10)" }
          }
        }
      }
    }
  ];

  // Save user message
  await supabase.from('ai_chat_conversations').insert({
    organization_id: organizationId,
    user_id: userId,
    role: 'user',
    message: messages[messages.length - 1].content,
    created_at: new Date().toISOString()
  });

  // Call Lovable AI
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      tools,
      tool_choice: 'auto',
      stream: true,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('AI credits depleted. Please add funds to continue.');
    }
    const errorText = await response.text();
    logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'error', `AI API error: ${errorText}`);
    throw new Error('AI service error');
  }

  // Stream response back to client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';
      let fullResponse = '';
      let collectedToolCalls: any[] = [];
      let toolCallResults: any[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }

              // Handle function calls
              const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
              if (toolCalls) {
                for (const toolCall of toolCalls) {
                  if (toolCall.function?.name) {
                    const functionName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments || '{}');
                    
                    logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'info', 
                      `Executing function: ${functionName} with args: ${JSON.stringify(args)}`);

                    let functionResult;
                    if (functionName === 'getAssetHealthPrediction') {
                      functionResult = await getAssetHealthPrediction(supabase, organizationId, args.asset_id);
                    } else if (functionName === 'analyzeMeterTrends') {
                      functionResult = await analyzeMeterTrends(supabase, organizationId, args.asset_id, args.days_back || 30);
                    } else if (functionName === 'getWorkOrderPriorities') {
                      functionResult = await getWorkOrderPriorities(supabase, organizationId, args.limit || 10);
                    }

                    // Collect the tool call and result for follow-up
                    collectedToolCalls.push({
                      id: toolCall.id,
                      type: 'function',
                      function: {
                        name: functionName,
                        arguments: JSON.stringify(args)
                      }
                    });

                    toolCallResults.push({
                      role: 'tool',
                      tool_call_id: toolCall.id,
                      name: functionName,
                      content: JSON.stringify(functionResult)
                    });
                  }
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }

        // If functions were called, make follow-up request with results
        if (toolCallResults.length > 0) {
          logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'info', 
            `Making follow-up request with ${toolCallResults.length} function results`);

          // Build follow-up messages
          const followUpMessages = [
            { role: 'system', content: systemPrompt },
            ...messages,
            { 
              role: 'assistant', 
              content: fullResponse || null,
              tool_calls: collectedToolCalls 
            },
            ...toolCallResults
          ];

          // Make follow-up API call
          const followUpResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: followUpMessages,
              stream: true,
            }),
          });

          if (!followUpResponse.ok) {
            logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'error', 
              `Follow-up AI request failed with status ${followUpResponse.status}`);
          } else {
            // Stream the follow-up response
            const followUpReader = followUpResponse.body?.getReader();
            if (followUpReader) {
              let followUpBuffer = '';

              while (true) {
                const { done, value } = await followUpReader.read();
                if (done) break;

                followUpBuffer += new TextDecoder().decode(value);
                const lines = followUpBuffer.split('\n');
                followUpBuffer = lines.pop() || '';

                for (const line of lines) {
                  if (!line.trim() || line.startsWith(':')) continue;
                  if (!line.startsWith('data: ')) continue;

                  const data = line.slice(6).trim();
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      fullResponse += content;
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }
          }
        }

        // Save assistant response
        if (fullResponse) {
          await supabase.from('ai_chat_conversations').insert({
            organization_id: organizationId,
            user_id: userId,
            role: 'assistant',
            message: fullResponse,
            model_used: 'google/gemini-2.5-flash',
            tokens_used: Math.ceil(fullResponse.length / 4),
            response_time_ms: Date.now() - startTime,
            created_at: new Date().toISOString()
          });
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        logWithCorrelation(correlationId, 'predictive-maintenance-ai', 'error', 
          `Stream error: ${error instanceof Error ? error.message : 'Unknown'}`);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Function: Get asset health prediction
 */
async function getAssetHealthPrediction(supabase: any, organizationId: string, assetId: string) {
  const { data, error } = await supabase
    .from('ml_predictions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('asset_id', assetId)
    .eq('prediction_type', 'health_score')
    .order('predicted_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return { error: error.message, asset_id: assetId };
  }

  return {
    asset_id: assetId,
    health_score: data.health_score,
    failure_probability_30d: data.failure_probability_30d,
    failure_probability_60d: data.failure_probability_60d,
    failure_probability_90d: data.failure_probability_90d,
    contributing_factors: data.contributing_factors,
    confidence_score: data.confidence_score,
    predicted_at: data.predicted_at
  };
}

/**
 * Function: Analyze meter trends and anomalies
 */
async function analyzeMeterTrends(supabase: any, organizationId: string, assetId: string, daysBack: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('anomaly_detections')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('asset_id', assetId)
    .gte('detected_at', cutoffDate.toISOString())
    .order('detected_at', { ascending: false });

  if (error) {
    return { error: error.message, asset_id: assetId };
  }

  return {
    asset_id: assetId,
    days_analyzed: daysBack,
    anomalies: data.map((a: any) => ({
      type: a.anomaly_type,
      severity: a.severity,
      score: a.anomaly_score,
      description: a.description,
      detected_at: a.detected_at,
      status: a.status
    }))
  };
}

/**
 * Function: Get prioritized work orders
 */
async function getWorkOrderPriorities(supabase: any, organizationId: string, limit: number) {
  const { data, error } = await supabase
    .from('workorder_service.work_orders')
    .select('*')
    .eq('organization_id', organizationId)
    .not('ai_priority_score', 'is', null)
    .order('ai_priority_score', { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return {
    work_orders: data.map((wo: any) => ({
      id: wo.id,
      title: wo.title,
      priority_score: wo.ai_priority_score,
      failure_risk: wo.predicted_failure_risk,
      ml_recommended: wo.ml_recommended,
      priority_factors: wo.ai_priority_factors,
      status: wo.status
    }))
  };
}

/**
 * Direct API handlers for non-chat actions
 */
async function handleGetAssetHealth(supabase: any, organizationId: string, correlationId: string) {
  const { data, error } = await supabase
    .from('ml_predictions')
    .select('*, assets!inner(name, asset_number)')
    .eq('ml_predictions.organization_id', organizationId)
    .eq('prediction_type', 'health_score')
    .order('predicted_at', { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ predictions: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetAnomalies(supabase: any, organizationId: string, correlationId: string) {
  const { data, error } = await supabase
    .from('anomaly_detections')
    .select('*, assets!inner(name, asset_number)')
    .eq('anomaly_detections.organization_id', organizationId)
    .eq('status', 'active')
    .order('detected_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ anomalies: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePrioritizeWorkOrders(supabase: any, organizationId: string, correlationId: string) {
  const { data, error } = await supabase
    .from('workorder_service.work_orders')
    .select('*')
    .eq('organization_id', organizationId)
    .not('ai_priority_score', 'is', null)
    .order('ai_priority_score', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ work_orders: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}