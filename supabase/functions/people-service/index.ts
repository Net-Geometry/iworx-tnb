import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * People & Labor Management Microservice
 * Handles: People, Teams, Skills, Crafts, and their relationships
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get organization context
    const { data: userOrgs } = await supabase.rpc('get_user_organizations', { _user_id: user.id });
    const { data: hasCrossAccess } = await supabase.rpc('has_cross_project_access', { _user_id: user.id });

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p && p !== 'people-service');
    const method = req.method;

    console.log(`[People Service] ${method} /${pathParts.join('/')}`);

    // ========== PEOPLE ENDPOINTS ==========
    // List all people: GET /
    if (pathParts.length === 0 && method === 'GET') {
      let query = supabase
        .from('people')
        .select(`
          *,
          person_business_areas!inner (
            id,
            business_area_id,
            is_primary,
            assigned_date,
            business_area (
              id,
              business_area,
              region,
              state,
              station
            )
          )
        `);

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to match expected format
      const transformed = data?.map(person => ({
        ...person,
        business_areas: person.person_business_areas || [],
        person_business_areas: undefined,
      }));

      return new Response(JSON.stringify(transformed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get single person: GET /{id}
    if (pathParts.length === 1 && method === 'GET') {
      const firstPart = pathParts[0];
      
      // Check if this is actually a sub-resource route
      if (['teams', 'team-members', 'skills', 'person-skills', 'crafts', 'person-crafts'].includes(firstPart)) {
        // Will be handled by sub-resource sections below
      } else {
        const personId = firstPart;
      
      let query = supabase
        .from('people')
        .select(`
          *,
          person_business_areas!inner (
            id,
            business_area_id,
            is_primary,
            assigned_date,
            business_area (
              id,
              business_area,
              region,
              state,
              station
            )
          )
        `)
        .eq('id', personId);

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;

      if (data) {
        const transformed = {
          ...data,
          business_areas: data.person_business_areas || [],
          person_business_areas: undefined,
        };
        return new Response(JSON.stringify(transformed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

        return new Response(JSON.stringify(null), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create person: POST /
    if (pathParts.length === 0 && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('people')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update person: PUT /{id}
    if (pathParts.length === 1 && method === 'PUT') {
      const personId = pathParts[0];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('people')
        .update(body)
        .eq('id', personId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete person: DELETE /{id}
    if (pathParts.length === 1 && method === 'DELETE') {
      const personId = pathParts[0];
      
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== TEAMS ENDPOINTS ==========
    // List teams: GET /teams
    if (pathParts.length === 1 && pathParts[0] === 'teams' && method === 'GET') {
      let query = supabase
        .from('teams')
        .select('*')
        .order('team_name');

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get single team: GET /teams/{id}
    if (pathParts.length === 2 && pathParts[0] === 'teams' && method === 'GET') {
      const teamId = pathParts[1];
      
      let query = supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id,
            person_id,
            role_in_team,
            assigned_date,
            is_active,
            people (
              id,
              first_name,
              last_name,
              employee_number,
              email,
              job_title
            )
          )
        `)
        .eq('id', teamId);

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create team: POST /teams
    if (pathParts.length === 1 && pathParts[0] === 'teams' && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('teams')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update team: PUT /teams/{id}
    if (pathParts.length === 2 && pathParts[0] === 'teams' && method === 'PUT') {
      const teamId = pathParts[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('teams')
        .update(body)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete team: DELETE /teams/{id}
    if (pathParts.length === 2 && pathParts[0] === 'teams' && method === 'DELETE') {
      const teamId = pathParts[1];
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== TEAM MEMBERS ENDPOINTS ==========
    // List team members: GET /team-members
    if (pathParts.length === 1 && pathParts[0] === 'team-members' && method === 'GET') {
      const personId = url.searchParams.get('person_id');
      const teamId = url.searchParams.get('team_id');

      let query = supabase
        .from('team_members')
        .select(`
          *,
          teams (
            id,
            team_name,
            description,
            is_active
          )
        `);

      if (personId) {
        query = query.eq('person_id', personId);
      }

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create team member: POST /team-members
    if (pathParts.length === 1 && pathParts[0] === 'team-members' && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('team_members')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update team member: PUT /team-members/{id}
    if (pathParts.length === 2 && pathParts[0] === 'team-members' && method === 'PUT') {
      const memberId = pathParts[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('team_members')
        .update(body)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete team member: DELETE /team-members/{id}
    if (pathParts.length === 2 && pathParts[0] === 'team-members' && method === 'DELETE') {
      const memberId = pathParts[1];
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== SKILLS ENDPOINTS ==========
    // List skills: GET /skills
    if (pathParts.length === 1 && pathParts[0] === 'skills' && method === 'GET') {
      let query = supabase
        .from('skills')
        .select('*')
        .order('skill_name');

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create skill: POST /skills
    if (pathParts.length === 1 && pathParts[0] === 'skills' && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('skills')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update skill: PUT /skills/{id}
    if (pathParts.length === 2 && pathParts[0] === 'skills' && method === 'PUT') {
      const skillId = pathParts[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('skills')
        .update(body)
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete skill: DELETE /skills/{id}
    if (pathParts.length === 2 && pathParts[0] === 'skills' && method === 'DELETE') {
      const skillId = pathParts[1];
      
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== PERSON SKILLS ENDPOINTS ==========
    // List person skills: GET /person-skills
    if (pathParts.length === 1 && pathParts[0] === 'person-skills' && method === 'GET') {
      const personId = url.searchParams.get('person_id');

      let query = supabase
        .from('person_skills')
        .select('*');

      if (personId) {
        query = query.eq('person_id', personId);
      }

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create person skill: POST /person-skills
    if (pathParts.length === 1 && pathParts[0] === 'person-skills' && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('person_skills')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update person skill: PUT /person-skills/{id}
    if (pathParts.length === 2 && pathParts[0] === 'person-skills' && method === 'PUT') {
      const skillId = pathParts[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('person_skills')
        .update(body)
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete person skill: DELETE /person-skills/{id}
    if (pathParts.length === 2 && pathParts[0] === 'person-skills' && method === 'DELETE') {
      const skillId = pathParts[1];
      
      const { error } = await supabase
        .from('person_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== CRAFTS ENDPOINTS ==========
    // List crafts: GET /crafts
    if (pathParts.length === 1 && pathParts[0] === 'crafts' && method === 'GET') {
      let query = supabase
        .from('crafts')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create craft: POST /crafts
    if (pathParts.length === 1 && pathParts[0] === 'crafts' && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('crafts')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update craft: PUT /crafts/{id}
    if (pathParts.length === 2 && pathParts[0] === 'crafts' && method === 'PUT') {
      const craftId = pathParts[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('crafts')
        .update(body)
        .eq('id', craftId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete craft: DELETE /crafts/{id}
    if (pathParts.length === 2 && pathParts[0] === 'crafts' && method === 'DELETE') {
      const craftId = pathParts[1];
      
      const { error } = await supabase
        .from('crafts')
        .delete()
        .eq('id', craftId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== PERSON CRAFTS ENDPOINTS ==========
    // List person crafts: GET /person-crafts
    if (pathParts.length === 1 && pathParts[0] === 'person-crafts' && method === 'GET') {
      const personId = url.searchParams.get('person_id');

      let query = supabase
        .from('person_crafts')
        .select('*');

      if (personId) {
        query = query.eq('person_id', personId);
      }

      if (!hasCrossAccess && userOrgs?.length > 0) {
        query = query.in('organization_id', userOrgs);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create person craft: POST /person-crafts
    if (pathParts.length === 1 && pathParts[0] === 'person-crafts' && method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('person_crafts')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update person craft: PUT /person-crafts/{id}
    if (pathParts.length === 2 && pathParts[0] === 'person-crafts' && method === 'PUT') {
      const craftId = pathParts[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('person_crafts')
        .update(body)
        .eq('id', craftId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete person craft: DELETE /person-crafts/{id}
    if (pathParts.length === 2 && pathParts[0] === 'person-crafts' && method === 'DELETE') {
      const craftId = pathParts[1];
      
      const { error } = await supabase
        .from('person_crafts')
        .delete()
        .eq('id', craftId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[People Service Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
