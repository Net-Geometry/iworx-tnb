-- Create vector similarity search function for embeddings
CREATE OR REPLACE FUNCTION match_organization_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  entity_type VARCHAR(50),
  entity_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    organization_data_embeddings.id,
    organization_data_embeddings.organization_id,
    organization_data_embeddings.entity_type,
    organization_data_embeddings.entity_id,
    organization_data_embeddings.content,
    organization_data_embeddings.metadata,
    1 - (organization_data_embeddings.embedding <=> query_embedding) AS similarity
  FROM organization_data_embeddings
  WHERE 1 - (organization_data_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY organization_data_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fix search_path for refresh function (security warning fix)
CREATE OR REPLACE FUNCTION refresh_cost_analysis_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vertical_cost_analysis;
END;
$$;