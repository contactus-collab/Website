# Admin Login Setup Guide

This guide will help you set up the admin login feature for the Ball Four Foundation website.

## Prerequisites

1. A Supabase project with authentication enabled
2. Environment variables configured in Vercel (or your deployment platform)

## Step 1: Enable Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider (it's usually enabled by default)
4. Configure email settings if needed

## Step 2: Run Database Migrations

Run the authentication migration to set up the profiles table:

**Option A: Using Supabase CLI**
```bash
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/migrations/20240103000000_enable_auth.sql`
3. Click **Run**

## Step 3: Deploy Edge Function for User Creation

The admin user creation feature requires an Edge Function. Deploy it using Supabase CLI:

```bash
# Make sure you're logged in
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy create-admin-user
```

**Important:** You need to set the `SUPABASE_SERVICE_ROLE_KEY` as a secret for the edge function:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find your service role key in Supabase Dashboard → Settings → API → service_role key (keep this secret!)

## Step 4: Create the First Admin User

Since only admins can create other admins, you need to create the first admin user manually:

### Method 1: Using Supabase Dashboard (Recommended for First Admin)

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter the admin email and password
4. Click **Create user**
5. Go to **Table Editor** → **profiles**
6. Find the user you just created (or create a new profile if it doesn't exist)
7. Set the `role` field to `'admin'`:

```sql
-- Run this in SQL Editor after creating the user
INSERT INTO public.profiles (id, email, role)
VALUES (
  'user-id-from-auth-users-table',
  'your-admin@email.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

Or update existing profile:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
```

### Method 2: Using SQL (Alternative)

1. Create user via Supabase Auth API or Dashboard first
2. Then run the SQL above to set the role to 'admin'

## Step 5: Accessing the Admin Dashboard

1. Visit: `https://yourdomain.com/login`
2. Enter your admin email and password
3. You'll be redirected to `/admin` dashboard

**Note:** Only users with `role = 'admin'` in the `profiles` table can log in. Non-admin users will see an "Access denied" error.

## Step 6: Creating Additional Admin Users

Once you're logged in as an admin:

1. Go to the **Admin Dashboard** (`/admin`)
2. Scroll down to **Admin User Management** section
3. Enter the new admin's email and password
4. Click **Create Admin User**
5. The new user will be created with admin privileges automatically

**Important:** Only existing admins can create new admin users through the dashboard. This ensures security and prevents unauthorized access.

## Admin Dashboard Features

The admin dashboard currently shows:
- Newsletter subscriber count
- Notes count
- Quick actions to navigate the site
- Logout functionality

## Security Notes

1. **Environment Variables**: Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your deployment platform
2. **Password Policy**: Configure strong password requirements in Supabase Auth settings
3. **Email Verification**: Consider enabling email verification for added security
4. **Rate Limiting**: Supabase has built-in rate limiting for authentication
5. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### "Failed to sign in" error
- Check that the user exists in Supabase Auth
- Verify email and password are correct
- Check browser console for detailed error messages

### User can't access admin dashboard
- Verify the user is authenticated (check Supabase Auth → Users)
- Check that RLS policies are correctly set up
- Verify environment variables are set correctly

### Profile not created automatically
- Check that the trigger `on_auth_user_created` exists
- Verify the `handle_new_user()` function is working
- Manually create a profile if needed

## Next Steps

You can extend the admin dashboard to include:
- Newsletter subscriber management
- Notes/article creation and editing
- User management
- Analytics and statistics
- Content moderation

