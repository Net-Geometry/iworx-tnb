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
    console.log('=== Starting sync-orphaned-profiles function ===');

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

    // Step 1: Get all profiles
    console.log('Fetching all profiles...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, display_name');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles`);

    // Step 2: Get all auth users
    console.log('Fetching all auth users...');
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    console.log(`Found ${authUsers?.length || 0} auth users`);

    // Step 3: Find orphaned profiles
    const authUserIds = new Set(authUsers.map(u => u.id));
    const orphanedProfiles = profiles.filter(p => !authUserIds.has(p.id));

    console.log(`Found ${orphanedProfiles.length} orphaned profiles`);

    if (orphanedProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No orphaned profiles found',
          totalOrphaned: 0,
          created: 0,
          failed: 0,
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Step 4: Create auth users for orphaned profiles
    const results = [];
    let created = 0;
    let failed = 0;

    for (const profile of orphanedProfiles) {
      console.log(`\n--- Processing profile: ${profile.email} (${profile.id}) ---`);
      
      try {
        // Create auth user with the SAME UUID as the profile
        console.log(`Creating auth user with ID: ${profile.id}`);
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          id: profile.id, // Use existing profile UUID
          email: profile.email,
          password: '@Bcd1234', // Fixed password
          email_confirm: true, // User can login immediately
          user_metadata: {
            display_name: profile.display_name || profile.email.split('@')[0]
          }
        });

        if (createError) {
          console.error(`Error creating auth user for ${profile.email}:`, createError);
          failed++;
          results.push({
            profileId: profile.id,
            email: profile.email,
            success: false,
            error: createError.message
          });
          continue;
        }

        console.log(`Auth user created successfully for ${profile.email}`);

        // Generate and send password reset email
        console.log(`Sending password reset email to ${profile.email}...`);
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: profile.email
        });

        if (resetError) {
          console.warn(`Warning: Could not send password reset email to ${profile.email}:`, resetError);
          // Don't fail the whole operation, just log the warning
        } else {
          console.log(`Password reset email sent to ${profile.email}`);
        }

        created++;
        results.push({
          profileId: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          success: true,
          message: 'Auth user created successfully. Password reset email sent.',
          temporaryPassword: '@Bcd1234'
        });

      } catch (error: any) {
        console.error(`Exception processing profile ${profile.email}:`, error);
        failed++;
        results.push({
          profileId: profile.id,
          email: profile.email,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }

    console.log('\n=== Sync Summary ===');
    console.log(`Total orphaned profiles: ${orphanedProfiles.length}`);
    console.log(`Successfully created: ${created}`);
    console.log(`Failed: ${failed}`);
    console.log('===================\n');

    return new Response(
      JSON.stringify({ 
        message: `Sync completed. Created ${created} auth users, ${failed} failed.`,
        totalOrphaned: orphanedProfiles.length,
        created,
        failed,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in sync-orphaned-profiles function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to sync orphaned profiles',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
