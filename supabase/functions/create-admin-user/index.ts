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
    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !newUser.user) {
      throw createError || new Error('Failed to create user')
    }

    // Create or update profile with admin role
    // Use upsert to handle case where trigger already created a profile with 'user' role
    // First check if profile exists (created by trigger)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', newUser.user.id)
      .single()

    if (existingProfile) {
      // Profile exists (created by trigger), update it to admin
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email: newUser.user.email,
          role: 'admin',
        })
        .eq('id', newUser.user.id)

      if (updateError) {
        // Rollback: delete the auth user if profile update fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        throw updateError
      }
    } else {
      // Profile doesn't exist, insert it
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: newUser.user.id,
            email: newUser.user.email,
            role: 'admin',
          },
        ])

      if (insertError) {
        // Rollback: delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        },
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

