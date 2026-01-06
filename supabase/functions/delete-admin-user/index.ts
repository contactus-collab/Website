import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Check if the requesting user is an admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    // Parse request body
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Prevent admins from deleting their own profile
    if (userId === user.id) {
      throw new Error('You cannot delete your own profile')
    }

    // Verify the user to be deleted exists and is an admin
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (targetError || !targetProfile) {
      throw new Error('User not found')
    }

    // Delete the profile first
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      throw deleteProfileError
    }

    // Delete the auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      // If auth deletion fails, try to restore the profile
      await supabaseAdmin
        .from('profiles')
        .insert([targetProfile])
        .catch(() => {}) // Ignore errors if restore fails
      throw deleteAuthError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User deleted successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

