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
    const path = url.pathname.replace('/people-service', '');
    const method = req.method;

    console.log(`[People Service] ${method} ${path}`);

    // ========== PEOPLE ENDPOINTS ==========
    if (path === '/people' && method === 'GET') {
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

    if (path.startsWith('/people/') && method === 'GET') {
      const personId = path.split('/')[2];
      
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

    if (path === '/people' && method === 'POST') {
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

    if (path.startsWith('/people/') && method === 'PUT') {
      const personId = path.split('/')[2];
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

    if (path.startsWith('/people/') && method === 'DELETE') {
      const personId = path.split('/')[2];
      
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
    if (path === '/teams' && method === 'GET') {
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

    if (path.startsWith('/teams/') && method === 'GET') {
      const teamId = path.split('/')[2];
      
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

    if (path === '/teams' && method === 'POST') {
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

    if (path.startsWith('/teams/') && method === 'PUT') {
      const teamId = path.split('/')[2];
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

    if (path.startsWith('/teams/') && method === 'DELETE') {
      const teamId = path.split('/')[2];
      
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
    if (path === '/team-members' && method === 'GET') {
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

    if (path === '/team-members' && method === 'POST') {
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

    if (path.startsWith('/team-members/') && method === 'PUT') {
      const memberId = path.split('/')[2];
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

    if (path.startsWith('/team-members/') && method === 'DELETE') {
      const memberId = path.split('/')[2];
      
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
    if (path === '/skills' && method === 'GET') {
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

    if (path === '/skills' && method === 'POST') {
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

    if (path.startsWith('/skills/') && method === 'PUT') {
      const skillId = path.split('/')[2];
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

    if (path.startsWith('/skills/') && method === 'DELETE') {
      const skillId = path.split('/')[2];
      
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
    if (path === '/person-skills' && method === 'GET') {
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

    if (path === '/person-skills' && method === 'POST') {
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

    if (path.startsWith('/person-skills/') && method === 'PUT') {
      const skillId = path.split('/')[2];
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

    if (path.startsWith('/person-skills/') && method === 'DELETE') {
      const skillId = path.split('/')[2];
      
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
    if (path === '/crafts' && method === 'GET') {
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

    if (path === '/crafts' && method === 'POST') {
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

    if (path.startsWith('/crafts/') && method === 'PUT') {
      const craftId = path.split('/')[2];
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

    if (path.startsWith('/crafts/') && method === 'DELETE') {
      const craftId = path.split('/')[2];
      
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
    if (path === '/person-crafts' && method === 'GET') {
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

    if (path === '/person-crafts' && method === 'POST') {
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

    if (path.startsWith('/person-crafts/') && method === 'PUT') {
      const craftId = path.split('/')[2];
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

    if (path.startsWith('/person-crafts/') && method === 'DELETE') {
      const craftId = path.split('/')[2];
      
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
