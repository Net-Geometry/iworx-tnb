import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Parse request body
    const { email, password, displayName, roleId, organizationIds } = await req.json();

    // Validate required fields
    if (!email || !password || !roleId) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and roleId are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Creating user:', email);

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName || email.split('@')[0]
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('User created:', authData.user.id);

    // Assign role to user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id: roleId
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      throw roleError;
    }

    console.log('Role assigned successfully');

    // Assign user to organizations
    if (organizationIds && Array.isArray(organizationIds) && organizationIds.length > 0) {
      for (const orgId of organizationIds) {
        const { error: orgError } = await supabaseAdmin
          .from('user_organizations')
          .insert({
            user_id: authData.user.id,
            organization_id: orgId
          });

        if (orgError) {
          console.error('Organization assignment error:', orgError);
          throw orgError;
        }
      }
      console.log('Organizations assigned successfully');
    } else {
      // Default to MSMS if no organizations specified
      const { data: msmsOrg, error: msmsError } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('code', 'MSMS')
        .single();

      if (!msmsError && msmsOrg) {
        const { error: orgError } = await supabaseAdmin
          .from('user_organizations')
          .insert({
            user_id: authData.user.id,
            organization_id: msmsOrg.id
          });

        if (orgError) {
          console.error('Default organization assignment error:', orgError);
        } else {
          console.log('Assigned to default MSMS organization');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        userId: authData.user.id,
        message: 'User created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in create-user function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create user'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});