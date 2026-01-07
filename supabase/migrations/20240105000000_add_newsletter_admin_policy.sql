-- Add policies to allow admins to view, update, and delete newsletter subscribers
-- This enables the admin panel to display and manage the subscribers list

-- Policy to allow admins to view all newsletter subscribers
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter
  FOR SELECT USING (
    public.is_admin()
  );

-- Policy to allow admins to update newsletter subscribers (e.g., mark as unsubscribed)
CREATE POLICY "Admins can update newsletter subscribers" ON public.newsletter
  FOR UPDATE USING (
    public.is_admin()
  );

-- Policy to allow admins to delete newsletter subscribers
CREATE POLICY "Admins can delete newsletter subscribers" ON public.newsletter
  FOR DELETE USING (
    public.is_admin()
  );

