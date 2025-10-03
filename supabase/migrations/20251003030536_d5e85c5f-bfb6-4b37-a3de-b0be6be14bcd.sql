-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Store embeddings for entity-level data (work orders, incidents, assets, inventory)
CREATE TABLE IF NOT EXISTS organization_data_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'work_order', 'incident', 'asset', 'inventory'
  entity_id UUID NOT NULL,
  content TEXT NOT NULL, -- Searchable summary text
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB DEFAULT '{}', -- {cost, date, priority, status, etc}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store aggregated cost insights for faster retrieval
CREATE TABLE IF NOT EXISTS cross_vertical_cost_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type VARCHAR(100) NOT NULL, -- 'monthly_cost_summary', 'efficiency_analysis', 'anomaly_detection'
  time_period VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content TEXT NOT NULL, -- Natural language summary of the insight
  embedding VECTOR(1536),
  data JSONB NOT NULL, -- Structured cost data for charts
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_embeddings_org_type ON organization_data_embeddings(organization_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_created ON organization_data_embeddings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON organization_data_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_insights_period ON cross_vertical_cost_insights(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_insights_type ON cross_vertical_cost_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_vector ON cross_vertical_cost_insights USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS Policies - Only tnb_management role can access
ALTER TABLE organization_data_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_vertical_cost_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can access embeddings"
ON organization_data_embeddings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'tnb_management'));

CREATE POLICY "Superadmins can access insights"
ON cross_vertical_cost_insights FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'tnb_management'));

-- Materialized view for cost analytics aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vertical_cost_analysis AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.code as organization_code,
  DATE_TRUNC('month', COALESCE(wo.created_at, si.incident_date, NOW())) as month,
  
  -- Work Order Metrics
  COUNT(DISTINCT wo.id) as total_work_orders,
  COUNT(DISTINCT CASE WHEN wo.priority = 'critical' THEN wo.id END) as critical_work_orders,
  SUM(wo.estimated_cost) as total_estimated_cost,
  AVG(wo.estimated_cost) as avg_work_order_cost,
  
  -- Safety Incident Metrics
  COUNT(DISTINCT si.id) as total_incidents,
  COUNT(DISTINCT CASE WHEN si.severity = 'critical' THEN si.id END) as critical_incidents,
  SUM(si.cost_estimate) as total_incident_cost,
  
  -- Asset Metrics
  COUNT(DISTINCT a.id) as total_assets,
  COUNT(DISTINCT CASE WHEN a.criticality = 'critical' THEN a.id END) as critical_assets,
  
  -- Efficiency Metrics
  COUNT(DISTINCT CASE WHEN wo.status = 'completed' THEN wo.id END) as completed_work_orders,
  
  -- Inventory Metrics
  COUNT(DISTINCT ii.id) as inventory_items_count,
  SUM(ii.current_stock * ii.unit_cost) as total_inventory_value
  
FROM organizations o
LEFT JOIN work_orders wo ON wo.organization_id = o.id 
  AND wo.created_at >= NOW() - INTERVAL '12 months'
LEFT JOIN safety_incidents si ON si.organization_id = o.id 
  AND si.incident_date >= NOW() - INTERVAL '12 months'
LEFT JOIN assets a ON a.organization_id = o.id
LEFT JOIN inventory_items ii ON ii.organization_id = o.id
WHERE o.is_active = true
GROUP BY o.id, o.name, o.code, DATE_TRUNC('month', COALESCE(wo.created_at, si.incident_date, NOW()));

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cost_org_month ON mv_vertical_cost_analysis(organization_id, month);

-- Function to refresh materialized view (call this from edge function daily)
CREATE OR REPLACE FUNCTION refresh_cost_analysis_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vertical_cost_analysis;
END;
$$;

-- Table to store AI chat history for superadmins
CREATE TABLE IF NOT EXISTS superadmin_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store context, charts data, sources
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON superadmin_ai_conversations(user_id, created_at DESC);

ALTER TABLE superadmin_ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can access their own conversations"
ON superadmin_ai_conversations FOR ALL
TO authenticated
USING (user_id = auth.uid() AND has_role(auth.uid(), 'tnb_management'));