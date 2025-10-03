-- PostGIS Function: Find nearby people
CREATE OR REPLACE FUNCTION find_nearby_people(
  target_lat FLOAT,
  target_lng FLOAT,
  radius_km FLOAT DEFAULT 5,
  _organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  person_id UUID,
  person_name TEXT,
  distance_km NUMERIC,
  last_update TIMESTAMPTZ,
  current_lat FLOAT,
  current_lng FLOAT
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, people_service
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    CONCAT(p.first_name, ' ', p.last_name)::TEXT,
    ROUND((ST_Distance(
      p.current_location::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) / 1000)::numeric, 2) AS distance_km,
    p.last_location_update,
    ST_Y(p.current_location)::FLOAT AS current_lat,
    ST_X(p.current_location)::FLOAT AS current_lng
  FROM people_service.people p
  WHERE p.current_location IS NOT NULL
    AND (_organization_id IS NULL OR p.organization_id = _organization_id)
    AND ST_DWithin(
      p.current_location::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km;
END;
$$;

-- PostGIS Function: Check geofence status for a person
CREATE OR REPLACE FUNCTION check_geofence_status(_person_id UUID)
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  zone_type TEXT,
  is_inside BOOLEAN,
  distance_to_center_meters NUMERIC
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, people_service
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gz.id,
    gz.name::TEXT,
    COALESCE(gz.zone_type, '')::TEXT,
    ST_Within(p.current_location, gz.boundary) AS is_inside,
    ROUND(ST_Distance(
      p.current_location::geography,
      gz.center_point::geography
    )::numeric, 2) AS distance_to_center_meters
  FROM people_service.people p
  CROSS JOIN geofence_zones gz
  WHERE p.id = _person_id
    AND p.current_location IS NOT NULL
    AND gz.is_active = TRUE
    AND gz.organization_id = p.organization_id;
END;
$$;

-- PostGIS Function: Calculate travel distance
CREATE OR REPLACE FUNCTION calculate_travel_distance(
  _person_id UUID,
  _start_time TIMESTAMPTZ,
  _end_time TIMESTAMPTZ
)
RETURNS NUMERIC 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_distance_km NUMERIC;
BEGIN
  WITH ordered_locations AS (
    SELECT 
      location,
      tracked_at,
      LAG(location) OVER (ORDER BY tracked_at) AS prev_location
    FROM person_location_history
    WHERE person_id = _person_id
      AND tracked_at BETWEEN _start_time AND _end_time
    ORDER BY tracked_at
  )
  SELECT 
    ROUND((SUM(
      ST_Distance(
        prev_location::geography,
        location::geography
      )
    ) / 1000)::numeric, 2) INTO total_distance_km
  FROM ordered_locations
  WHERE prev_location IS NOT NULL;
  
  RETURN COALESCE(total_distance_km, 0);
END;
$$;

-- PostGIS Function: Find nearest technician with skills
CREATE OR REPLACE FUNCTION find_nearest_technician(
  target_lat FLOAT,
  target_lng FLOAT,
  required_skill_ids UUID[] DEFAULT NULL,
  max_distance_km FLOAT DEFAULT 50,
  _organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  person_id UUID,
  person_name TEXT,
  distance_km NUMERIC,
  matched_skills INTEGER,
  current_lat FLOAT,
  current_lng FLOAT
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, people_service
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    CONCAT(p.first_name, ' ', p.last_name)::TEXT,
    ROUND((ST_Distance(
      p.current_location::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) / 1000)::numeric, 2) AS distance_km,
    COALESCE(COUNT(DISTINCT ps.skill_id)::INTEGER, 0) AS matched_skills,
    ST_Y(p.current_location)::FLOAT AS current_lat,
    ST_X(p.current_location)::FLOAT AS current_lng
  FROM people_service.people p
  LEFT JOIN people_service.person_skills ps ON p.id = ps.person_id 
    AND (required_skill_ids IS NULL OR ps.skill_id = ANY(required_skill_ids))
  WHERE p.current_location IS NOT NULL
    AND p.is_active = TRUE
    AND p.employment_status = 'active'
    AND (_organization_id IS NULL OR p.organization_id = _organization_id)
    AND ST_DWithin(
      p.current_location::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
      max_distance_km * 1000
    )
  GROUP BY p.id, p.first_name, p.last_name, p.current_location
  ORDER BY matched_skills DESC, distance_km ASC;
END;
$$;