-- Add policies to allow admins to insert, update, and delete profiles for user management
-- This is useful for admin user creation via edge functions or admin dashboard

-- Policy to allow admins to insert profiles (for creating new admin users)
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

-- Policy to allow admins to update profiles (for updating user roles)
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    public.is_admin()
  );

-- Policy to allow admins to delete profiles (for deleting admin users)
-- Note: Edge functions use service role key which bypasses RLS, but this policy is useful for direct client access
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    public.is_admin()
  );

